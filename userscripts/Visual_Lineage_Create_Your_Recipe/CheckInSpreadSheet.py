import os
import sys
import csv
import requests
import json

spreadsheet="https://docs.google.com/spreadsheets/d/13e9R3hTknqifj92lTJHfKV5PGHshNLCgR2r-dT7enTc"+"/export?csv"



def checkSaveFileVsSpreadSheet():
   folder="./"
   files = [f for f in os.listdir(folder) if f.endswith('.json')]
   file=files[0]
   f=open(file, 'r', encoding="utf8")
   json1=json.load(f)
   x=requests.get(spreadsheet)
   print(x.text)



checkSaveFileVsSpreadSheet()