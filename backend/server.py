import json
from flask import Flask
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans


app = Flask(__name__)
app.config.from_pyfile("settings.py")

data = pd.read_csv('../data/spotify_processed_data.csv')
numeric_column_list = ['instrumentalness_percent', 'acousticness_percent', 'danceability_percent', 'valence_percent',
                       'energy_percent', 'liveness_percent', 'speechiness_percent']
numerical_data = data[numeric_column_list]
# Pre Process numerical_data
ss = StandardScaler()
numerical_data = ss.fit_transform(numerical_data)

# Applying PCA on numerical data
pca = PCA().fit(numerical_data)
pca_components = pca.transform(numerical_data)

kmeans_data = []
for k in range(1, 11, 1):
    kmeans = KMeans(n_clusters=k, random_state=66).fit(numerical_data)
    km_pred = kmeans.predict(numerical_data)
    kmeans_data.append(
        {'k': k, 'kmeans_intertia': kmeans.inertia_, 'km_pred': km_pred.tolist()})

biplot_display_data = []
print("PCA_Components size " + str(pca.components_.size))
for i in range(0, len(pca_components), 1):
    kmd = []
    for j in range(0, len(kmeans_data), 1):
        kmd.append(kmeans_data[j]['km_pred'][i])
    biplot_display_data.append({
        'pcs': pca_components[i].tolist(),
        'clusters': kmd
    })


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/apis/pca/sceePlotData", methods=['GET'])
def get_pca_scree_plot_data():
    return {
        'explained_variance_ratio': pca.explained_variance_ratio_.tolist(),
        'loadings': pca.components_.tolist()
    }


@app.route("/apis/pca/biPlotData", methods=['GET'])
def get_pca_bi_plot_data():
    return {
        'eigenvalues': pca.explained_variance_.tolist(),
        'components': pca_components.tolist(),
        'kmeans_data': kmeans_data,
        'display_data': biplot_display_data,
        'loadings': pca.components_.tolist()
    }


@app.route("/apis/pca/kMeansData", methods=['GET'])
def get_pca_k_means_data():
    return {
        'data': kmeans_data
    }


@app.route("/apis/pca/scatterplotMatrix", methods=['GET'])
def get_pca_scatterplot_matrix_data():
    return {
        'display_data': biplot_display_data,
        'loadings': pca.components_.tolist()
    }


if __name__ == '__main__':
    # Make the server publicly available
    app.run(host='0.0.0.0', port=8080, debug=True)
