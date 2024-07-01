package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestHello(t *testing.T) {
	mux := newHandler()
	server := httptest.NewServer(mux)
	resp, err := http.Get(server.URL + "/api/grafana/json")
	require.NoError(t, err)
	require.Equal(t, resp.StatusCode, 200)
	rawBody, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	require.NoError(t, err)
	require.Equal(t, string(rawBody), "ok")
}

func TestQuery(t *testing.T) {
	mux := newHandler()
	server := httptest.NewServer(mux)
	data := `{"panelId":1,"range":{"from":"2016-10-31T06:33:44.866Z","to":"2016-10-31T12:33:44.866Z","raw":{"from":"now-6h","to":"now"}},"rangeRaw":{"from":"now-6h","to":"now"},"interval":"30s","intervalMs":30000,"maxDataPoints":550,"targets":[{"target":"Packets","refId":"A"},{"target":"Errors","refId":"B"}],"filters":[{"key":"City","operator":"=","value":"Berlin"}]}`
	resp, err := http.Post(server.URL+"/api/grafana/json/query", "application/json", bytes.NewBuffer([]byte(data)))
	require.NoError(t, err)
	require.Equal(t, resp.StatusCode, 200)
	rawBody, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	require.NoError(t, err)
	var queryResp []QueryResp
	require.NoError(t, json.Unmarshal(rawBody, &queryResp))
	require.Len(t, queryResp, 2)
	require.Len(t, queryResp[0].DataPoints, 2)
}

func TestSearch(t *testing.T) {
	mux := newHandler()
	server := httptest.NewServer(mux)
	data := `{"range":{"from":"2022-02-14T08:09:32.164Z","to":"2022-02-21T08:09:32.164Z","raw":{"from":"now-7d","to":"now"}},"target":""}`
	resp, err := http.Post(server.URL+"/api/grafana/json/search", "application/json", bytes.NewBuffer([]byte(data)))
	require.NoError(t, err)
	require.Equal(t, resp.StatusCode, 200)
	rawBody, err := io.ReadAll(resp.Body)
	resp.Body.Close()
	require.NoError(t, err)
	searchResp := []SearchResp{}
	require.NoError(t, json.Unmarshal(rawBody, &searchResp))
	require.Len(t, searchResp, 2)
	require.EqualValues(t, "Label 1", searchResp[0].Text)
}
