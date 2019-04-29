
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
    state_df['state_code'] = [state_mapping.stateCodes[x] if x in state_mapping.stateCodes else "" for x in
                              new_state_values];

    grouped_df = state_df.groupby(['new_state','state_code', 'case_status']).size().unstack(fill_value=0)
    final_df = pd.DataFrame(grouped_df.reset_index().values,
                            columns=["State", 'state_code',"Certified", "Certified-Expired", "Denied", "Withdrawn"])
    final_df = final_df[final_df.state_code != ""]
    final_df = final_df.rename(index=str, columns={"Certified-Expired": "Expired"})

    return final_df;


def prepare_company_df():
    df = pd.read_csv(filename)
    state_df = df[['employer_state', 'case_status', 'employer_name']]
    grouped_df = state_df.groupby(['employer_name']).count()
    final_df = pd.DataFrame(grouped_df.reset_index().values, columns=["employer_name", "Count1", "Count2"])
    final_df = final_df[final_df.employer_name != ""]
    final_df = final_df[['employer_name', 'Count1']]

    employer_names = final_df['employer_name'].values;
    mod_employer_names = []
    #
    for val in employer_names:
        if val in state_mapping.company_mapping:
            mod_employer_names.append(state_mapping.company_mapping[val]);
        else:
            mod_employer_names.append(val);

    final_df['mod_employer_name'] = mod_employer_names
    final_df.sort_values("Count1", inplace=True, ascending=False)
    final_df.reset_index(level=0, drop=True, inplace=True)
    final_df = final_df.head(20);
    return final_df;


def prepare_success_percent_state_data():
    df = pd.read_csv(filename)
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
    state_df['state_code'] = [state_mapping.stateCodes[x] if x in state_mapping.stateCodes else "" for x in
                              new_state_values];

    grouped_df = state_df.groupby(['new_state', 'state_code', 'case_status']).size().unstack(fill_value=0)
    final_df = pd.DataFrame(grouped_df.reset_index().values,
                            columns=["State", 'state_code', "Certified", "Certified-Expired", "Denied", "Withdrawn"])
    final_df = final_df[final_df.state_code != ""]
    final_df = final_df.rename(index=str, columns={"Certified-Expired": "Expired"})
    list_name = ["Certified", "Expired", "Denied", "Withdrawn"]
    final_df['total'] = final_df.loc[:, list_name].sum(axis=1)
    final_df['success_percent'] = final_df['Certified'] * 100 / final_df['total'];
    final_df = final_df[['State', 'state_code', 'success_percent', 'total']]
    return final_df;



def prepare_success_percent_company_df():
    df = pd.read_csv(filename);
    df = df[df.employer_name != ""];
    state_df = df[['employer_state', 'case_status', 'employer_name']]
    grouped_df = state_df.groupby(['employer_name', 'case_status']).count().unstack(fill_value=0)
    print(grouped_df.columns)
    final_df = pd.DataFrame(grouped_df.reset_index().values,
                            columns=["employer_name", "Certified", "Certified-Expired", "Denied", "Withdrawn"])
    final_df = final_df.rename(index=str, columns={"Certified-Expired": "Expired"})
    list_name = ["Certified", "Expired", "Denied", "Withdrawn"]
    final_df['total'] = final_df.loc[:, list_name].sum(axis=1)

    # final_df=final_df[final_df.employer_name != ""];
    final_df = final_df[final_df.total > 500]
    final_df['success_percent'] = final_df['Certified']*100/final_df['total'];
    final_df.sort_values("success_percent", inplace=True, ascending=False)

    employer_names = final_df['employer_name'].values;
    mod_employer_names = []
    #
    for val in employer_names:
        if val in state_mapping.company_mapping:
            mod_employer_names.append(state_mapping.company_mapping[val]);
        else:
            mod_employer_names.append(val);

    final_df['mod_employer_name'] = mod_employer_names

    final_df.reset_index(level=0, drop=True, inplace=True)
    final_df = final_df.head(20);
    return final_df;


@app.route('/stateMap')
def get_state_decision_data():
    return state_df.to_json(orient="records");

@app.route('/percentStateMap')
def get_percent_state_decision_data():
    return success_percent_state_data.to_json(orient="records");


@app.route('/companybar')
def get_company_bar_chart():
    return company_df.to_json(orient="records");

@app.route('/percentcompanybar')
def get_percent_company_bar_chart():
    return success_percent_company_data.to_json(orient="records");


if __name__ == '__main__':
    state_df=prepare_state_df();
    company_df=prepare_company_df();
    success_percent_state_data=prepare_success_percent_state_data();
    success_percent_company_data=prepare_success_percent_company_df();

    app.run("localhost", 8080, debug=True)
