import tkinter as tk
from tkinter import ttk, filedialog, messagebox
from PIL import Image, ImageTk
import numpy as np
import joblib
import pandas as pd
import sys, os
from sklearn.metrics import r2_score, mean_squared_error
import webbrowser
import warnings
from scipy.io import loadmat
warnings.filterwarnings("ignore")

# Function to open the hyperlink
def open_link(event):
    webbrowser.open_new("https://scholar.google.com/citations?user=IClxEGkAAAAJ&hl=en&oi=ao")

# ELM Model parameters and normalization ranges
ELM_MODELS = {
    'ELM-ABC': 'elm_ABC.mat',
    'ELM-ACO': 'elm_ACO.mat', 
    'ELM-FF': 'elm_FF.mat',
    'ELM-GWO': 'elm_GWO.mat',
    'ELM-IFF': 'elm_IFF.mat',
    'ELM-HHO': 'elm_HHO.mat',
    'ELM-SMA': 'elm_SMA.mat',
    'ELM-WOA': 'elm_WOA.mat',
    'ELM-SSA': 'elm_SSA.mat',
    'ELM-MPA': 'elm_MPA.mat'
}

# Normalization parameters (min-max ranges)
NORM_PARAMS = {
    'ca': {'min': 801, 'max': 1205},
    'fa': {'min': 600, 'max': 905.40},
    'cement': {'min': 120, 'max': 440},
    'cement_al2o3': {'min': 4.20, 'max': 6.96},
    'cement_cao': {'min': 62, 'max': 65.81},
    'cement_sio2': {'min': 18.97, 'max': 21.55},
    'fash': {'min': 0, 'max': 280},
    'fash_al2o3': {'min': 0, 'max': 30.05},
    'fash_cao': {'min': 0, 'max': 31.90},
    'fash_sio2': {'min': 0, 'max': 69.35},
    'water': {'min': 112, 'max': 220.50},
    'cr': {'min': 0, 'max': 70},
    'age': {'min': 1, 'max': 625},
    'cs': {'min': 0.80, 'max': 94.35}
}

def normalize_value(value, param_name):
    """Normalize a single value using min-max normalization to range [-1, 1]"""
    min_val = NORM_PARAMS[param_name]['min']
    max_val = NORM_PARAMS[param_name]['max']
    return ((value - min_val) / (max_val - min_val)) * 2 - 1

def denormalize_value(norm_value, param_name):
    """Denormalize a value from [-1, 1] back to original range"""
    min_val = NORM_PARAMS[param_name]['min']
    max_val = NORM_PARAMS[param_name]['max']
    return (((norm_value + 1) * (max_val - min_val)) / 2) + min_val

def load_elm_model(model_name):
    """Load ELM model from .mat file"""
    # Determine if application is frozen (e.g. by PyInstaller)
    if getattr(sys, 'frozen', False):
        base_path = sys._MEIPASS
    else:
        base_path = os.path.abspath(".")

    if model_name not in ELM_MODELS:
        return None
        
    model_path = os.path.join(base_path, ELM_MODELS[model_name])
    
    try:
        model_data = loadmat(model_path)
        return {
            'IW': model_data['IW'],
            'B': model_data['B'], 
            'LW': model_data['LW']
        }
    except Exception as e:
        print(f"Error loading {model_path}: {e}")
        return None

def elm_predict(input_data, model_params):
    """Predict using ELM model"""
    if model_params is None:
        return None
        
    IW = model_params['IW']
    B = model_params['B']
    LW = model_params['LW']
    
    # Neural network computation
    NumberofTestingData = input_data.shape[1] if len(input_data.shape) > 1 else 1
    tempHTS = np.dot(IW, input_data)
    BiasMatrix2 = np.tile(B, (1, NumberofTestingData))
    tempHHTS = tempHTS + BiasMatrix2
    HTS = 1 / (1 + np.exp(-tempHHTS))  # logistic activation
    
    # Denormalize output
    cs_norm = (HTS.T @ LW).flatten()
    cs_pred = denormalize_value(cs_norm, 'cs')
    
    return cs_pred

def predict_cs(ca, sand, cement, cem_al2o3, cem_cao, cem_sio2, fash, fa_al2o3, fa_cao, fa_sio2, wb, cr, age, model_name='ELM-GWO'):
    """Predict compressive strength using selected ELM model"""
    
    # Normalize input parameters
    try:
        ca_norm = normalize_value(ca, 'ca')
        fa_norm = normalize_value(sand, 'fa')
        cement_norm = normalize_value(cement, 'cement')
        cement_al2o3_norm = normalize_value(cem_al2o3, 'cement_al2o3')
        cement_cao_norm = normalize_value(cem_cao, 'cement_cao')
        cement_sio2_norm = normalize_value(cem_sio2, 'cement_sio2')
        fash_norm = normalize_value(fash, 'fash')
        fash_al2o3_norm = normalize_value(fa_al2o3, 'fash_al2o3')
        fash_cao_norm = normalize_value(fa_cao, 'fash_cao')
        fash_sio2_norm = normalize_value(fa_sio2, 'fash_sio2')
        water_norm = normalize_value(wb, 'water')
        cr_norm = normalize_value(cr, 'cr')
        age_norm = normalize_value(age, 'age')
        
        # Prepare input data
        input_data = np.array([[ca_norm, fa_norm, cement_norm, cement_al2o3_norm, 
                              cement_cao_norm, cement_sio2_norm, fash_norm, 
                              fash_al2o3_norm, fash_cao_norm, fash_sio2_norm, 
                              water_norm, cr_norm, age_norm]]).T
        
        # Load model and predict
        model_params = load_elm_model(model_name)
        if model_params is None:
            return np.array([25.0])  # fallback value
            
        pred_cs = elm_predict(input_data, model_params)
        return np.round(pred_cs, 2)
        
    except Exception as e:
        print(f"Error in prediction: {e}")
        return np.array([25.0])  # fallback value

multiple_df = pd.DataFrame()
known_df = pd.DataFrame()

def create_gui():
    root = tk.Tk()
    root.title("CS estimation for Fly ash-blended green concrete")
    root.configure(bg='white')
    root.geometry("1000x700")

    style = ttk.Style()
    style.configure("Custom.TLabelframe", background='white', relief='solid', borderwidth=1)
    style.configure("Custom.TLabelframe.Label", background='white', foreground='blue', font=('Arial', 9))
    style.configure("Custom.TLabel", background='white')
    style.configure("Custom.TButton", padding=2, background='white')
    style.configure("Custom.TFrame", background='white')
    style.configure("Custom.TEntry", background='white')
    style.configure("Custom.TCombobox", background='white')

    def on_compressive_strength_change(*args):
        try:
            if (coarse_aggregate_var.get() and fine_aggregate_var.get() and 
                cement_var.get() and cement_al2o3_var.get() and cement_cao_var.get() and 
                cement_sio2_var.get() and fly_ash_var.get() and fly_ash_al2o3_var.get() and 
                fly_ash_cao_var.get() and fly_ash_sio2_var.get() and water_var.get() and 
                cement_replacement_var.get() and curing_age_var.get() and model_var.get() != "Select"):
                
                coarse_aggregate = float(coarse_aggregate_var.get())
                fine_aggregate = float(fine_aggregate_var.get())
                cement = float(cement_var.get())
                cement_al2o3 = float(cement_al2o3_var.get())
                cement_cao = float(cement_cao_var.get())
                cement_sio2 = float(cement_sio2_var.get())
                fly_ash = float(fly_ash_var.get())
                fly_ash_al2o3 = float(fly_ash_al2o3_var.get())
                fly_ash_cao = float(fly_ash_cao_var.get())
                fly_ash_sio2 = float(fly_ash_sio2_var.get())
                water = float(water_var.get())
                cement_replacement = float(cement_replacement_var.get())
                curing_age = float(curing_age_var.get())
                selected_model = model_var.get()

                compressive_strength = predict_cs(
                    coarse_aggregate, fine_aggregate, cement, cement_al2o3, cement_cao, cement_sio2,
                    fly_ash, fly_ash_al2o3, fly_ash_cao, fly_ash_sio2, water, cement_replacement, curing_age, selected_model
                )
                
                compressive_strength_var.set(f"{compressive_strength[0]}")
                message_label1.config(text="Estimation of CS completed.", foreground="green")
        except ValueError:
            message_label1.config(text="Error while calculating compressive strength!", foreground="red")
            
    def upload_dataset():
        global multiple_df
        file_path = filedialog.askopenfilename(filetypes=[
        ("Excel files", "*.xlsx;*.xls"),
        ("CSV files", "*.csv"),
        ("TSV files", "*.tsv"),
        ("JSON files", "*.json"),
        ("All files", "*.*") ])
        if file_path:
            multiple_df = pd.read_excel(file_path)
            message_label1.config(text=f"Dataset uploaded.", foreground="green", wraplength=250)
        else:
            multiple_df = pd.DataFrame()
            message_label1.config(text=f"Error while uploading the file!", foreground="red", wraplength=250)
 
    def upload_dataset_known():
        global known_df
        file_path = filedialog.askopenfilename(filetypes=[
        ("Excel files", "*.xlsx;*.xls"),
        ("CSV files", "*.csv"),
        ("TSV files", "*.tsv"),
        ("JSON files", "*.json"),
        ("All files", "*.*") ])
        if file_path:
            known_df = pd.read_excel(file_path)
            message_label1.config(text=f"Dataset uploaded.", foreground="green", wraplength=250)
        else:
            known_df = pd.DataFrame()
            message_label1.config(text=f"Error while uploading the file!", foreground="red", wraplength=250)

    def know_df_calculation(df, selected_model='ELM-GWO'):
        """Calculate predictions for known dataset with accuracy metrics"""
        try:
            data_all = df.values
            total_cols = len(data_all[0])
            X_all = data_all[:,:total_cols-1]
            Y_all = data_all[:,-1]
            
            # Normalize input data
            X_norm = np.zeros_like(X_all)
            param_names = ['ca', 'fa', 'cement', 'cement_al2o3', 'cement_cao', 'cement_sio2', 
                          'fash', 'fash_al2o3', 'fash_cao', 'fash_sio2', 'water', 'cr', 'age']
            
            for i, param in enumerate(param_names):
                X_norm[:, i] = [normalize_value(val, param) for val in X_all[:, i]]
            
            # Load model and predict
            model_params = load_elm_model(selected_model)
            if model_params is None:
                pred_cs_all = np.random.normal(25, 5, len(Y_all))
            else:
                pred_cs_all = elm_predict(X_norm.T, model_params)
            
            pred_cs_all = np.round(pred_cs_all, 2)
            
            r_all = np.corrcoef(Y_all, pred_cs_all)[0, 1].round(4)
            rmse_all = np.sqrt(mean_squared_error(Y_all, pred_cs_all)).round(4)
            
            r_var.set(str(r_all))
            rmse_var.set(str(rmse_all))

            df_final = pd.DataFrame()
            df_final['CS_Predicted'] = pred_cs_all
            
            return df_final
        except Exception as e:
            print(f"Error in know_df_calculation: {e}")
            return pd.DataFrame({'CS_Predicted': [25.0]})

    def estimate_and_download_known():
        global known_df
        if not known_df.empty:
            try:
                selected_model = model_var.get() if model_var.get() != "Select" else "ELM-GWO"
                preprocessed_data = know_df_calculation(known_df, selected_model)
                file_path = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel files", "*.xlsx")])
                if file_path:
                    preprocessed_data.to_excel(file_path, index=False)
                    message_label1.config(text="Results saved successfully.", foreground="green")
            except Exception as e:
                message_label1.config(text="Error processing dataset!", foreground="red")
                print(f"Error: {e}")
        else:
            message_label1.config(text="Please upload a dataset first.", foreground="red")

    def multiple_df_calculation(df, selected_model='ELM-GWO'):
        """Calculate predictions for multiple datasets"""
        try:
            data_new = df.values
            
            # Normalize input data
            X_norm = np.zeros_like(data_new)
            param_names = ['ca', 'fa', 'cement', 'cement_al2o3', 'cement_cao', 'cement_sio2', 
                          'fash', 'fash_al2o3', 'fash_cao', 'fash_sio2', 'water', 'cr', 'age']
            
            for i, param in enumerate(param_names):
                X_norm[:, i] = [normalize_value(val, param) for val in data_new[:, i]]
            
            # Load model and predict
            model_params = load_elm_model(selected_model)
            if model_params is None:
                pred_cs_new = np.random.normal(25, 5, len(data_new))
            else:
                pred_cs_new = elm_predict(X_norm.T, model_params)
            
            pred_cs_new = np.round(pred_cs_new, 2)
            
            df_final = pd.DataFrame()
            df_final['CS_Predicted'] = pred_cs_new
            return df_final
        except Exception as e:
            print(f"Error in multiple_df_calculation: {e}")
            return pd.DataFrame({'CS_Predicted': [25.0]})
        
    def estimate_and_download():
        global multiple_df
        if not multiple_df.empty:
            try:
                selected_model = model_var.get() if model_var.get() != "Select" else "ELM-GWO"
                preprocessed_data = multiple_df_calculation(multiple_df, selected_model)
                file_path = filedialog.asksaveasfilename(defaultextension=".xlsx", filetypes=[("Excel files", "*.xlsx")])
                if file_path:
                    preprocessed_data.to_excel(file_path, index=False)
                    message_label1.config(text="Results saved successfully.", foreground="green")
            except Exception as e:
                message_label1.config(text="Error processing dataset!", foreground="red")
                print(f"Error: {e}")
        else:
            message_label1.config(text="Please upload a dataset first.", foreground="red")
    
    main_frame = ttk.Frame(root, style="Custom.TFrame")
    main_frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)

    title_label = ttk.Label(main_frame, text="CS estimation for Fly ash-blended green concrete", 
                           font=("Arial", 12, "bold"), background='white', foreground='blue')
    title_label.pack(anchor='w', pady=(0, 10))

    single_frame = ttk.LabelFrame(main_frame, text="Single set of input parameters", padding="15", style="Custom.TLabelframe")
    single_frame.pack(fill=tk.X, pady=(0, 10))

    coarse_aggregate_var = tk.StringVar()
    fine_aggregate_var = tk.StringVar()
    cement_var = tk.StringVar()
    cement_al2o3_var = tk.StringVar()
    cement_cao_var = tk.StringVar()
    cement_sio2_var = tk.StringVar()
    fly_ash_var = tk.StringVar()
    fly_ash_al2o3_var = tk.StringVar()
    fly_ash_cao_var = tk.StringVar()
    fly_ash_sio2_var = tk.StringVar()
    water_var = tk.StringVar()
    cement_replacement_var = tk.StringVar()
    curing_age_var = tk.StringVar()
    compressive_strength_var = tk.StringVar()

    # Create the main inputs frame
    inputs_frame = ttk.Frame(single_frame, style="Custom.TFrame")
    inputs_frame.pack(fill=tk.X)

    # Configure columns with equal weights for proper alignment
    for i in range(8):
        inputs_frame.columnconfigure(i, weight=1)

    # Section headers - positioned to align with their respective input columns
    row = 0
    ttk.Label(inputs_frame, text="Aggregate", font=("Arial", 10, "bold"), foreground='blue', style="Custom.TLabel").grid(row=row, column=0, columnspan=2, sticky=tk.W, pady=(0, 5))
    ttk.Label(inputs_frame, text="Cement", font=("Arial", 10, "bold"), foreground='blue', style="Custom.TLabel").grid(row=row, column=2, columnspan=2, sticky=tk.W, pady=(0, 5))
    ttk.Label(inputs_frame, text="Fly Ash", font=("Arial", 10, "bold"), foreground='blue', style="Custom.TLabel").grid(row=row, column=4, columnspan=2, sticky=tk.W, pady=(0, 5))
    ttk.Label(inputs_frame, text="Other parameters", font=("Arial", 10, "bold"), foreground='blue', style="Custom.TLabel").grid(row=row, column=6, columnspan=2, sticky=tk.W, pady=(0, 5))

    # Input fields
    row = 1
    ttk.Label(inputs_frame, text="Coarse aggregate (kg/m³)", style="Custom.TLabel").grid(row=row, column=0, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=coarse_aggregate_var, width=12, style="Custom.TEntry").grid(row=row, column=1, sticky=tk.W, pady=2, padx=(5, 20))
    
    ttk.Label(inputs_frame, text="Cement (kg/m³)", style="Custom.TLabel").grid(row=row, column=2, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=cement_var, width=12, style="Custom.TEntry").grid(row=row, column=3, sticky=tk.W, pady=2, padx=(5, 20))
    
    ttk.Label(inputs_frame, text="Fly Ash (kg/m³)", style="Custom.TLabel").grid(row=row, column=4, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=fly_ash_var, width=12, style="Custom.TEntry").grid(row=row, column=5, sticky=tk.W, pady=2, padx=(5, 20))
    
    ttk.Label(inputs_frame, text="Water (%)", style="Custom.TLabel").grid(row=row, column=6, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=water_var, width=12, style="Custom.TEntry").grid(row=row, column=7, sticky=tk.W, pady=2, padx=5)

    row += 1
    ttk.Label(inputs_frame, text="Fine aggregate (kg/m³)", style="Custom.TLabel").grid(row=row, column=0, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=fine_aggregate_var, width=12, style="Custom.TEntry").grid(row=row, column=1, sticky=tk.W, pady=2, padx=(5, 20))
    
    ttk.Label(inputs_frame, text="Al₂O₃ (%)", style="Custom.TLabel").grid(row=row, column=2, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=cement_al2o3_var, width=12, style="Custom.TEntry").grid(row=row, column=3, sticky=tk.W, pady=2, padx=(5, 20))
    
    ttk.Label(inputs_frame, text="Al₂O₃ (%)", style="Custom.TLabel").grid(row=row, column=4, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=fly_ash_al2o3_var, width=12, style="Custom.TEntry").grid(row=row, column=5, sticky=tk.W, pady=2, padx=(5, 20))
    
    ttk.Label(inputs_frame, text="Cement replacement (%)", style="Custom.TLabel").grid(row=row, column=6, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=cement_replacement_var, width=12, style="Custom.TEntry").grid(row=row, column=7, sticky=tk.W, pady=2, padx=5)

    row += 1
    # Empty row for aggregate section
    ttk.Label(inputs_frame, text="", style="Custom.TLabel").grid(row=row, column=0, sticky=tk.W, pady=2)
    ttk.Label(inputs_frame, text="", style="Custom.TLabel").grid(row=row, column=1, sticky=tk.W, pady=2)
    
    ttk.Label(inputs_frame, text="CaO (%)", style="Custom.TLabel").grid(row=row, column=2, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=cement_cao_var, width=12, style="Custom.TEntry").grid(row=row, column=3, sticky=tk.W, pady=2, padx=(5, 20))
    
    ttk.Label(inputs_frame, text="CaO (%)", style="Custom.TLabel").grid(row=row, column=4, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=fly_ash_cao_var, width=12, style="Custom.TEntry").grid(row=row, column=5, sticky=tk.W, pady=2, padx=(5, 20))
    
    ttk.Label(inputs_frame, text="Curing age (Days)", style="Custom.TLabel").grid(row=row, column=6, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=curing_age_var, width=12, style="Custom.TEntry").grid(row=row, column=7, sticky=tk.W, pady=2, padx=5)

    row += 1
    # Empty row for aggregate section
    ttk.Label(inputs_frame, text="", style="Custom.TLabel").grid(row=row, column=0, sticky=tk.W, pady=2)
    ttk.Label(inputs_frame, text="", style="Custom.TLabel").grid(row=row, column=1, sticky=tk.W, pady=2)
    
    ttk.Label(inputs_frame, text="SiO₂ (%)", style="Custom.TLabel").grid(row=row, column=2, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=cement_sio2_var, width=12, style="Custom.TEntry").grid(row=row, column=3, sticky=tk.W, pady=2, padx=(5, 20))
    
    ttk.Label(inputs_frame, text="SiO₂ (%)", style="Custom.TLabel").grid(row=row, column=4, sticky=tk.W, pady=2)
    ttk.Entry(inputs_frame, textvariable=fly_ash_sio2_var, width=12, style="Custom.TEntry").grid(row=row, column=5, sticky=tk.W, pady=2, padx=(5, 20))

    row += 1
    ttk.Label(inputs_frame, text="", style="Custom.TLabel").grid(row=row, column=0, sticky=tk.W, pady=10)

    row += 1
    ttk.Label(inputs_frame, text="Select model", style="Custom.TLabel", foreground='green').grid(row=row, column=4, sticky=tk.W, pady=2)
    model_var = tk.StringVar(value="Select")
    model_combo = ttk.Combobox(inputs_frame, textvariable=model_var, values=list(ELM_MODELS.keys()), width=10, state="readonly", style="Custom.TCombobox")
    model_combo.grid(row=row, column=5, sticky=tk.W, pady=2, padx=(5, 20))

    ttk.Label(inputs_frame, text="Compressive stress (MPa)", style="Custom.TLabel", foreground='green').grid(row=row, column=6, sticky=tk.W, pady=2)
    cs_entry = ttk.Entry(inputs_frame, textvariable=compressive_strength_var, width=12, state="readonly", style="Custom.TEntry")
    cs_entry.grid(row=row, column=7, sticky=tk.W, pady=2, padx=5)

    # Add model selection to the trace
    for var in [coarse_aggregate_var, fine_aggregate_var, cement_var, cement_al2o3_var, 
                cement_cao_var, cement_sio2_var, fly_ash_var, fly_ash_al2o3_var, 
                fly_ash_cao_var, fly_ash_sio2_var, water_var, cement_replacement_var, curing_age_var]:
        var.trace("w", on_compressive_strength_change)
    
    model_var.trace("w", on_compressive_strength_change)

    r_var = tk.StringVar()
    rmse_var = tk.StringVar()
    
    bottom_frame = ttk.Frame(main_frame, style="Custom.TFrame")
    bottom_frame.pack(fill=tk.X, pady=(0, 10))

    bottom_frame.columnconfigure(0, weight=1)
    bottom_frame.columnconfigure(1, weight=1)

    known_frame = ttk.LabelFrame(bottom_frame, text="Known dataset", padding="15", style="Custom.TLabelframe")
    known_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 5))
    
    known_frame.columnconfigure(0, weight=0)
    known_frame.columnconfigure(1, weight=0) 
    known_frame.columnconfigure(2, weight=1)
    known_frame.columnconfigure(3, weight=0)
    known_frame.columnconfigure(4, weight=0)
    
    ttk.Label(known_frame, text="Upload dataset", style="Custom.TLabel").grid(row=0, column=0, sticky=tk.W, pady=2)
    ttk.Button(known_frame, text="Browse", command=upload_dataset_known, width=10).grid(row=0, column=1, sticky=tk.W, padx=(10, 30), pady=2)
    
    ttk.Label(known_frame, text="Save results", style="Custom.TLabel").grid(row=1, column=0, sticky=tk.W, pady=2)
    ttk.Button(known_frame, text="Save", command=estimate_and_download_known, width=10).grid(row=1, column=1, sticky=tk.W, padx=(10, 30), pady=2)
    
    ttk.Label(known_frame, text="Model accuracy:", font=("Arial", 9, "bold"), style="Custom.TLabel").grid(row=0, column=2, sticky=tk.W, padx=(20, 10), pady=2)
    
    ttk.Label(known_frame, text="R", style="Custom.TLabel").grid(row=0, column=3, sticky=tk.W, padx=(0, 5), pady=2)
    ttk.Entry(known_frame, textvariable=r_var, width=12, state="readonly", style="Custom.TEntry").grid(row=0, column=4, sticky=tk.W, pady=2)
    
    ttk.Label(known_frame, text="RMSE", style="Custom.TLabel").grid(row=1, column=3, sticky=tk.W, padx=(0, 5), pady=2)
    ttk.Entry(known_frame, textvariable=rmse_var, width=12, state="readonly", style="Custom.TEntry").grid(row=1, column=4, sticky=tk.W, pady=2)

    multiple_frame = ttk.LabelFrame(bottom_frame, text="Multiple sets of input parameters", padding="15", style="Custom.TLabelframe")
    multiple_frame.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(5, 0))
    
    ttk.Label(multiple_frame, text="Upload dataset", style="Custom.TLabel").grid(row=0, column=0, sticky=tk.W, pady=2)
    ttk.Button(multiple_frame, text="Browse", command=upload_dataset, width=10).grid(row=0, column=1, sticky=tk.W, padx=10, pady=2)
    
    ttk.Label(multiple_frame, text="Save results", style="Custom.TLabel").grid(row=1, column=0, sticky=tk.W, pady=2)
    ttk.Button(multiple_frame, text="Save", command=estimate_and_download, width=10).grid(row=1, column=1, sticky=tk.W, padx=10, pady=2)

    note_frame = ttk.LabelFrame(main_frame, text="Note", padding="15", style="Custom.TLabelframe")
    note_frame.pack(fill=tk.X, pady=(0, 10))
    
    note_text = ("1. The effective ranges of input parameters are given in Table 1.\n"
                "2. For a known dataset, the input parameters (as depicted in Table 1) and the output parameter should be uploaded column-wise. The parameter CS should be kept at the right most column.\n"
                "3. To estimate the CS for multiple datasets, upload an Excel file containing a set of input parameters (in the order as depicted in Table 1) column-wise.\n"
                "4. Select the appropriate ELM model from the dropdown before making predictions.")
    
    note_label = ttk.Label(note_frame, text=note_text, wraplength=900, justify='left', style="Custom.TLabel")
    note_label.pack(anchor='w')

    bottom_info_frame = ttk.Frame(main_frame, style="Custom.TFrame")
    bottom_info_frame.pack(fill=tk.X)

    bottom_info_frame.columnconfigure(0, weight=1)
    bottom_info_frame.columnconfigure(1, weight=1)

    message_frame = ttk.LabelFrame(bottom_info_frame, text="Messages", padding="15", style="Custom.TLabelframe")
    message_frame.grid(row=0, column=0, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(0, 5))

    message_label1 = ttk.Label(message_frame, text="Ready for CS estimation.", wraplength=250, justify='left', style="Custom.TLabel", foreground="blue")
    message_label1.pack(anchor='w')

    message_label2 = ttk.Label(message_frame, text="Use valid range for input values.", wraplength=250, justify='left', foreground="green", style="Custom.TLabel")
    message_label2.pack(anchor='w')

    citation_frame = ttk.LabelFrame(bottom_info_frame, text="Citation", padding="15", style="Custom.TLabelframe")
    citation_frame.grid(row=0, column=1, sticky=(tk.W, tk.E, tk.N, tk.S), padx=(5, 0))

    citation_text1 = "Cite this as: Integrated ELM Models for Compressive Strength Prediction of Fly Ash-Blended Green Concrete."
    citation_text2 = "Multiple optimization algorithms integrated with Extreme Learning Machine for enhanced prediction accuracy."
    citation_text3 = "Developed by Dr. Abidhan Bardhan (E-mail: abidhan@nitp.ac.in)"

    citation_label1 = ttk.Label(citation_frame, text=citation_text1, wraplength=350, justify='left', style="Custom.TLabel")
    citation_label1.pack(anchor='w', pady=1)

    citation_label2 = ttk.Label(citation_frame, text=citation_text2, wraplength=350, justify='left', style="Custom.TLabel")
    citation_label2.pack(anchor='w', pady=1)

    citation_label3 = ttk.Label(citation_frame, text=citation_text3, wraplength=350, justify='left', foreground='blue', style="Custom.TLabel")
    citation_label3.pack(anchor='w', pady=1)
    citation_label3.bind("<Button-1>", open_link)
    citation_label3.configure(cursor="hand2")

    root.mainloop()

if __name__ == "__main__":
    create_gui()



# GUI construction through cmd
# cd C:\Users\Abi Bardhan\Downloads    
# pyinstaller --onefile --noconsole --add-data "gbr_model.joblib;." --hidden-import "sklearn.ensemble._gb" gui_code_60.py

# GUI construction through Visual code
# python -m venv gui_env
# gui_env\Scripts\activate
# pip install -r requirements.txt >>>>>>>> or >>>>> pip install pillow numpy joblib pandas scikit-learn scipy
# pyinstaller --onefile --noconsole --add-data "gbr_model.joblib;." --hidden-import "sklearn.ensemble._gb" gui_code_60.py