#!/usr/bin/env python

import json

data = {}
emptyset = {
  "WG 1": 0, "WG 2": 0, "WG 3": 0,
  "WG 1&2": 0, "WG 1&3": 0, "WG 2&3": 0,
  "WG 1&2&3": 0
}

def filler(dico, gr, va):
    va = int(va)
    if "1+2+3" in gr:
        for k in dico:
            dico[k] += va
    elif "+" in gr:
        figs = sorted(gr.lstrip("WG").split("+"))
        dico["WG %s&%s" % (figs[0], figs[1])] += va
        for i in figs:
            dico["WG %s" % i] += va
    else:
        dico["WG %s" % gr.lstrip("WG")] += va

with open("participations_by_ar_wg_cumulated_in_same_ar.csv") as f:
    for line in f.read().split("\n")[1:-1]:
        ar, gr, va = line.split(",")
        ar = "AR-%s" % ar
        if ar not in data:
            data[ar] = dict(emptyset)
        filler(data[ar], gr, va)

for fil, ar in [
  ("any", "AR-global"),
  ("same", "AR-intra"),
  ("distinct", "AR-inter"),
]:
    with open("participations_by_wg_cumulated_in_%s_ar.csv" % fil) as f:
        data[ar] = dict(emptyset)
        for line in f.read().split("\n")[1:-1]:
            gr, va = line.split(",")
            filler(data[ar], gr, va)

with open("participations-wg-venn.json", "w") as f:
    json.dump(data, f)
