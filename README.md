# 🛡️ ML Network Traffic & Threat Classifier

A full-stack Machine Learning-based Network Intrusion Detection System (NIDS) that analyzes network connection features to identify potentially malicious traffic and classify network services. The project combines machine learning models with an interactive web dashboard for threat prediction, model comparison, and feature analysis.

## 📌 Overview

Network traffic can contain normal connections as well as malicious activities such as denial-of-service attacks, probing, and unauthorized access attempts. This project uses the **NSL-KDD dataset** to train and evaluate machine learning models for network traffic classification.

The application supports two classification tasks:

- **Task A — Binary Threat Detection:** Classifies network connections as `NORMAL` or `ATTACK`.
- **Task B — Multiclass Service Classification:** Classifies traffic into eight service categories using network traffic features.

## ✨ Features

- **Threat Detection:** Predicts whether a network connection is normal or potentially malicious.
- **Service Classification:** Classifies traffic into eight service categories.
- **Multiple ML Models:** Compares Decision Tree, Support Vector Machine, and Gaussian Naive Bayes.
- **Interactive Prediction:** Submit network connection features through the web interface and view predictions.
- **Prediction Probabilities:** Displays model confidence estimates where supported.
- **Model Benchmarking:** Presents saved performance metrics for comparing models.
- **Feature Importance:** Helps explore which features influence the Decision Tree model.
- **Data Preprocessing:** Uses One-Hot Encoding for categorical features and Standard Scaling for numerical features.
- **REST API:** Provides backend endpoints for model inference and dashboard functionality.

## 🧠 Machine Learning Models

The project implements three machine learning algorithms.

| Model | Approach |
|---|---|
| Decision Tree | Uses entropy and information gain to learn decision rules |
| Support Vector Machine (SVM) | Uses an RBF kernel to learn nonlinear decision boundaries |
| Gaussian Naive Bayes | Uses Bayes' theorem with a Gaussian feature likelihood assumption |

Each trained model is saved as a reusable Scikit-learn pipeline that combines preprocessing and classification.

### Classification Tasks

**Task A: Binary Threat Detection**

- `0` — Normal traffic
- `1` — Attack traffic

**Task B: Multiclass Service Classification**

The target categories are:

- `http`
- `smtp`
- `ftp`
- `ftp_data`
- `domain_u`
- `telnet`
- `daytime`
- `other`

The service input column is excluded from the Task B feature set to reduce target leakage.

## 📊 Dataset

This project uses the **NSL-KDD network intrusion detection dataset**, a benchmark dataset for evaluating intrusion detection methods.

The dataset contains network connection records with numerical and categorical features, including:

- Connection duration and protocol information
- Source and destination byte counts
- Connection flags and login information
- Connection and host-based traffic statistics

The data is preprocessed before being supplied to the machine learning models.

## 🛠️ Technology Stack

### Machine Learning and Backend
- Python
- Scikit-learn
- Pandas
- NumPy
- Joblib
- FastAPI
- Uvicorn

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React icons

## 🏗️ System Architecture

The application follows a frontend-backend-machine-learning architecture.

1. **Frontend:** Collects input features and displays predictions, benchmarks, and feature analysis.
2. **API Layer:** Receives requests and routes them to the relevant prediction functionality.
3. **Model Manager:** Loads the saved preprocessing and classification pipelines.
4. **Preprocessing:** Encodes categorical features and scales numerical features.
5. **Inference:** The selected model generates a prediction and, where supported, probability estimates.
6. **Dashboard:** Displays the results to the user.

## 📁 Project Structure

The main project components are organized into the following areas:

```text
ML_network_classifier/
├── backend/
│   └── app/
│       ├── main.py
│       ├── routes.py
│       ├── model_loader.py
│       └── schemas.py
├── frontend/
│   └── src/
│       ├── App.jsx
│       ├── index.css
│       └── api/
│           ├── client.js
│           └── fallbackData.js
├── ml/
│   ├── train.py
│   └── data_loader.py
├── models/
│   ├── task_a_dt.joblib
│   ├── task_a_svm.joblib
│   ├── task_a_gnb.joblib
│   ├── task_b_dt.joblib
│   ├── task_b_svm.joblib
│   └── task_b_gnb.joblib
└── README.md
```

*Note: This is a high-level representation. Your local repository may contain additional configuration, dataset, and frontend files.*

## 🚀 Getting Started

### Prerequisites

Install the following before running the project:

- Python
- Node.js and npm
- Git

### 1. Clone the Repository

```bash
git clone https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
cd YOUR_REPOSITORY
```

Replace the repository URL with your GitHub repository URL.

### 2. Set Up the Backend

Create and activate a Python virtual environment from the project root.

**Windows:**

```bash
python -m venv .venv
.venv\Scripts\activate
```

Install the dependencies listed in the backend or project requirements file. For example, if `requirements.txt` is in the project root:

```bash
pip install -r requirements.txt
```

Start the FastAPI server using the entry point and import path configured in your project. If the entry point is `backend/app/main.py` and the application object is named `app`, the command may be:

```bash
uvicorn backend.app.main:app --reload
```

### 3. Set Up the Frontend

Open a separate terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local URL displayed by Vite in your terminal.

**Important:** The commands above assume the standard root-level Python requirements file and the stated FastAPI import path. Adjust them if your repository uses a different configuration.

## 📈 Model Evaluation

The project includes saved performance metrics for both classification tasks.

| Model | Task A — Binary Accuracy | Task B — Multiclass Accuracy |
|---|---:|---:|
| Decision Tree | 78.27% | 84.07% |
| SVM | 77.25% | 82.97% |
| Gaussian Naive Bayes | 71.07% | 52.84% |

These figures are the project's documented results. They are included for comparison and should be interpreted in the context of the dataset, preprocessing, and evaluation procedure.

## 🔒 Security and Limitations

- This project is intended for educational and research purposes.
- Model predictions are estimates, not definitive proof that traffic is safe or malicious.
- Performance on benchmark data may differ from performance on live network traffic.
- The application should not be treated as a replacement for production-grade network security monitoring.
- Do not commit credentials, API keys, virtual environments, or unnecessary local files to the repository.

## 🔮 Future Improvements

- Evaluate the models using precision, recall, F1-score, and confusion matrices.
- Improve detection of less frequent attack categories.
- Test performance on additional network traffic datasets.
- Add monitoring and logging for prediction requests.
- Explore deployment with appropriate authentication and security controls.

## 👩‍💻 Author

**Your Name**

GitHub: [YOUR_GITHUB_PROFILE](https://github.com/YOUR_USERNAME)

## 📄 License

Choose and add a suitable open-source license if you intend to distribute or reuse this project under specific terms.
