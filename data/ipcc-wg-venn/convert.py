#!/usr/bin/env python

import json, copy

data = {}
emptyset = {
  "sets": [
    {"label": "WG 1", "size": 0, "color": "#EA3133"},
    {"label": "WG 2", "size": 0, "color": "#00A0DB"},
    {"label": "WG 3", "size": 0, "color": "#FFEB50"}
  ],
  "overlaps": [
    {"label": "WGs 1&2", "sets": [0, 1], "size": 0, "color": "#961479"},
    {"label": "WGs 1&3", "sets": [0, 2], "size": 0, "color": "#F59233"},
    {"label": "WGs 2&3", "sets": [1, 2], "size": 0, "color": "#94BE3F"},
    {"label": "WGs 1&2&3", "sets": [0, 1, 2], "size": 0, "color": "#888"}
  ]
}

def filler(dico, gr, va):
    va = int(va)
    if "1+2+3" in gr:
        for k in dico["sets"]:
            k["size"] += va
        for k in dico["overlaps"]:
            k["size"] += va
    elif "+" in gr:
        figs = sorted([int(i) for i in gr.lstrip("WG").split("+")])
        for i in figs:
            dico["sets"][i-1]["size"] += va
        for k in dico["overlaps"]:
            if k["label"] == "WGs %s&%s" % (figs[0], figs[1]):
                k["size"] += va
    else:
        dico["sets"][int(gr.lstrip("WG"))-1]["size"] += va

with open("participations_by_ar_wg_cumulated_in_same_ar.csv") as f:
    for line in f.read().split("\n")[1:-1]:
        ar, gr, va = line.split(",")
        ar = "AR-%s" % ar
        if ar not in data:
            data[ar] = copy.deepcopy(emptyset)
        filler(data[ar], gr, va)

for fil, ar in [
  ("any", "AR-global"),
  ("same", "AR-intra"),
  ("distinct", "AR-inter"),
]:
    with open("participations_by_wg_cumulated_in_%s_ar.csv" % fil) as f:
        data[ar] = copy.deepcopy(emptyset)
        for line in f.read().split("\n")[1:-1]:
            gr, va = line.split(",")
            filler(data[ar], gr, va)

with open("authors-by-wg-by-ar-venn.json", "w") as f:
    json.dump(data, f)
