package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
)

func newHandler() http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/api/grafana/json", hello)
	mux.HandleFunc("/api/grafana/json/query", query)
	mux.HandleFunc("/api/grafana/json/search", search)
	return mux
}

func main() {
	log.Println("grafana api: /api/grafana/json")
	log.Println("listen 0.0.0.0:8081")
	http.ListenAndServe(":8181", newHandler())
}

type GrafanaRangeRaw struct {
	From string `json:"from"`
	To   string `json:"to"`
}

type GrafanaRange struct {
	From string          `json:"from"`
	To   string          `json:"to"`
	Raw  GrafanaRangeRaw `json:"raw"`
}

type GrafanaTarget struct {
	Target string `json:"target"`
	RefId  string `json:"refId"`
}

type QueryReq struct {
	PanelId       int64           `json:"panelId"`
	Range         GrafanaRange    `json:"range"`
	RangeRaw      GrafanaRangeRaw `json:"ranegRaw"`
	Interval      string          `json:"interval"`
	IntervalMs    int64           `json:"intervalMs"`
	MaxDataPoints int64           `json:"maxDataPoints"`
	Targets       []GrafanaTarget `json:"targets"`
	Filters       interface{}     `json:"filters"`
}

type QueryResp struct {
	Target     string      `json:"target"`
	DataPoints [][]float64 `json:"datapoints"`
}

func query(writer http.ResponseWriter, request *http.Request) {
	body, err := io.ReadAll(request.Body)
	if err != nil {
		http.Error(writer, "error reading request body", http.StatusInternalServerError)
		return
	}
	var req QueryReq
	err = json.Unmarshal(body, &req)
	if err != nil {
		http.Error(writer, "error while unmarshal", http.StatusInternalServerError)
		return
	}
	fmt.Printf("req is: %+v\n", req)

	var resp []QueryResp = []QueryResp{
		{Target: "pps in", DataPoints: [][]float64{{622, 1450754160000}, {365, 1450754220000}}},
		{Target: "pps out", DataPoints: [][]float64{{861, 1450754160000}, {767, 1450754220000}}},
	}
	respBytes, err := json.Marshal(resp)
	if err != nil {
		http.Error(writer, "error while marshal", http.StatusInternalServerError)
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	writer.Write(respBytes)
}

type SearchReq struct {
	Target string       `json:"target"`
	Range  GrafanaRange `json:"range"`
}

type SearchResp struct {
	Text  string `json:"text"`
	Value string `json:"value"`
}

func search(writer http.ResponseWriter, request *http.Request) {
	body, err := io.ReadAll(request.Body)
	if err != nil {
		http.Error(writer, "error reading request body", http.StatusInternalServerError)
		return
	}
	var req SearchReq
	err = json.Unmarshal(body, &req)
	if err != nil {
		http.Error(writer, "error while unmarshal", http.StatusInternalServerError)
		return
	}
	fmt.Printf("req is: %+v\n", req)

	var resp []SearchResp = []SearchResp{
		{Text: "Label 1", Value: "Value 1"},
		{Text: "Label 2", Value: "Value 2"},
	}
	respBytes, err := json.Marshal(resp)
	if err != nil {
		http.Error(writer, "error while marshal", http.StatusInternalServerError)
		return
	}
	writer.Header().Set("Content-Type", "application/json")
	writer.Write(respBytes)
}

func hello(writer http.ResponseWriter, request *http.Request) {
	writer.Write([]byte("ok"))
}
