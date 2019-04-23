
import json
import pandas as pd
from flask import Flask,request
from flask import render_template
import pandas as pd
import numpy as np
from utils import state_mapping


app = Flask(__name__)
filename='./data/us_perm_visas.csv';

df=pd.read_csv(filename);


@app.route('/')
def completedata():
    return render_template("index.html")

def prepare_state_df():
    df = pd.read_csv(filename)
    df = df.head(100)
    # state_df=df[['case_no','employer_state','foreign_worker_info_state','job_info_work_state','case_status']]
    state_df = df[['case_no', 'employer_state', 'case_status']]
    state_df = state_df.dropna();
    state_values = state_df['employer_state'].values;
    new_state_values = []
    #
    for val in state_values:
        if val in state_mapping.state_map:
            new_state_values.append(state_mapping.state_map[val].upper());
        else:
            new_state_values.append(val.upper());
    state_df['new_state'] = new_state_values
    # grouped_df=state_df.groupby(['new_state'])['case_status'].value_counts()
    # print(new_state_values)
    grouped_df = state_df.groupby(['new_state', 'case_status']).size().unstack(fill_value=0)
    # print(grouped_df.columns)
    #
    final_df = pd.DataFrame(grouped_df.reset_index().values,
                            columns=["State", "Certified", "Certified-Expired", "Denied", "Withdrawn"])
    # print(df.to_json(orient='records'))
    # return render_template('statemap.html', html=final_df.to_html())
    # return pd.json.dumps(final_df);
    return final_df;


@app.route('/stateMap')
def get_state_decision_data():
    return state_df.to_json(orient="records");

if __name__ == '__main__':

    state_df=prepare_state_df();
    app.run("localhost", 8080, debug=True)
