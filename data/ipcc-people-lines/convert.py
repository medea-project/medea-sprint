#!/usr/bin/env python

import os, csv, json

countries = {}
roles = {
  "CLA": "Coordinating Lead Author",
  "LA":  "Lead Author",
  "RE":  "Review Editor",
  "CA":  "Contributing Author"
}

chapter_id = lambda l: "%s-%s-%s" % (l["ar"], l["wg"], l.get("chapter", l.get("number", None)))

clean = lambda t: t if t != "NULL" else None

chaptitles = {}
with open("chapters.csv") as f:
    for l in csv.DictReader(f):
        chaptitles[chapter_id(l)] = l["title"]

countrycodes = {}
with open("countries.csv") as f:
    for l in csv.DictReader(f):
        countrycodes[l["name"]] = l["code"].replace("/", "-")

with open("participations.csv") as f:
    for l in csv.DictReader(f):
        cnt = countrycodes[l["Country (INFO)"]]
        if cnt not in countries:
            countries[cnt] = {}
        if l["author_id"] not in countries[cnt]:
            countries[cnt][l["author_id"]] = {
              "name": l["Author (INFO)"],
              "institution": clean(l["Institution (INFO)"]),
              "department": clean(l["Department (INFO)"]),
              "ar1": {
                "total": 0,
                "participations": []
              },
              "ar2": {
                "total": 0,
                "participations": []
              },
              "ar3": {
                "total": 0,
                "participations": []
              },
              "ar4": {
                "total": 0,
                "participations": []
              },
              "ar5": {
                "total": 0,
                "participations": []
              }
            }
        arid = "ar%s" % l["ar"]
        countries[cnt][l["author_id"]][arid]["total"] += 1
        countries[cnt][l["author_id"]][arid]["participations"].append({
            "role": roles[l["role"]],
            "wg": l["wg"],
            "chapter": l["chapter"],
            "chapter_title": chaptitles[chapter_id(l)]
        })

if not os.path.isdir("countries"):
    os.makedirs("countries")
with open(os.path.join("countries", "list.json"), "w") as f:
    for k,v in countrycodes.items():
        if v not in countries or not countries[v]:
            del(countrycodes[k])
    json.dump(countrycodes, f)
for c in countries:
    with open(os.path.join("countries", "ipcc-people-participations-%s.json" % c), "w") as f:
        json.dump(countries[c], f)
