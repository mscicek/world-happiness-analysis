from flask import Flask, render_template, jsonify
import pandas as pd
import os

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/data')
def api_data():
    file_path = "data/world_happiness_report.csv"
    if not os.path.exists(file_path):
        return jsonify([])

    try:
        df = pd.read_csv(file_path)
        df = df.rename(columns={
            'Country': 'country',
            'Happiness Score': 'happiness',
            'Economy (GDP per Capita)': 'economy',
            'Health (Life Expectancy)': 'health',
            'Freedom': 'freedom'
        })
        cols = ['country', 'happiness', 'economy', 'health', 'freedom']
        final_df = df[cols].dropna(subset=cols)
        return jsonify(final_df.to_dict(orient='records'))
    except Exception as e:
        print(f"Hata: {e}")
        return jsonify([])

if __name__ == '__main__':
    app.run(debug=True)