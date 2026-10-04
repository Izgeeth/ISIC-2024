# ISIC 2024 Skin Cancer Detection

A deep learning-based skin lesion classification project that uses dermoscopic images from the **ISIC 2024 dataset** to detect potentially malignant skin lesions.

The project focuses on building an end-to-end image classification pipeline, including data preprocessing, augmentation, model training, validation, and inference using PyTorch.

## Overview

Skin lesions can exhibit subtle visual differences between benign and malignant cases, making automated classification a challenging computer vision problem.

This project uses deep learning to learn visual representations from dermoscopic images and classify skin lesions into benign and malignant categories.

## Features

- Image preprocessing and normalization
- Data augmentation using Albumentations
- Transfer learning with pretrained deep learning models
- Model training using PyTorch
- Cross-validation for reliable evaluation
- Model inference on unseen images
- Prediction generation for evaluation

## Dataset

The project uses dermoscopic skin lesion images and associated metadata from the **ISIC 2024 dataset**, provided through the ISIC 2024 Skin Cancer Detection competition.

The dataset is not included in this repository due to its size and usage restrictions.

## Approach

### Data Preprocessing

The images are preprocessed before being passed to the model, including resizing, normalization, and other transformations required by the pretrained network.

### Data Augmentation

Albumentations is used to apply image transformations during training to improve generalization and reduce overfitting.

### Model

The classification model is implemented using **PyTorch** and **TIMM**, leveraging pretrained computer vision architectures through transfer learning.

The model is fine-tuned to learn features specific to skin lesion classification.

### Validation

Cross-validation is used to evaluate the model across different subsets of the training data and obtain a more robust estimate of its performance.

### Inference

The trained model can be used to process unseen dermoscopic images and generate predictions for skin lesion classification.

## Project Structure

```text
ISIC-2024/
│
├── train.py
├── inference.py
├── requirements.txt
├── README.md
└── ...
```

## Tech Stack

- Python
- PyTorch
- TIMM
- Albumentations
- Pandas
- NumPy
- Scikit-learn

## Installation

Clone the repository:

```bash
git clone https://github.com/Izgeeth/ISIC-2024.git
cd ISIC-2024
```

Install the required dependencies:

```bash
pip install -r requirements.txt
```

## Training

Run the training pipeline:

```bash
python train.py
```

This performs image preprocessing, augmentation, model training, and validation.

## Inference

Run inference using the trained model:

```bash
python inference.py
```

The script processes the input images and generates the corresponding predictions.

## Future Improvements

- Incorporate patient metadata alongside image features
- Experiment with additional pretrained architectures
- Improve class imbalance handling
- Apply model ensembling
- Add a web-based interface for image-based predictions

## Acknowledgements

The dermoscopic images and associated data used in this project are sourced from the **ISIC 2024 dataset** made available through the ISIC 2024 Skin Cancer Detection competition.

## License

This project is intended for educational and research purposes. Refer to the original ISIC dataset and competition terms for applicable data usage restrictions.
