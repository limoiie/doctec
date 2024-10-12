import {Layout} from 'antd';
import React, {Component} from "react";
import {BrowserRouter, Route, Routes} from "react-router-dom";

import "./App.css";
import {eel} from "./eel.js";
import {EmbeddingDetectionPage} from "./pages/EmbeddingDetectionPage";
import {EmbeddingDetectionResultPage} from "./pages/EmbeddingDetectionResultPage";
import {EmbeddedFileDetailsPage} from "./pages/EmbeddedFileDetailsPage";

const {Header, Footer, Content} = Layout;

// noinspection JSUnresolvedReference
class App extends Component {
  constructor(props) {
    super(props);
    eel.set_host("ws://localhost:8888");
  }

  render() {
    return (
        <Layout className="App">
          <Header className="App-header">Doc Embedding Detector</Header>
          <Content className="App-content">
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<EmbeddingDetectionPage/>}/>
                <Route path="/result/:resultId"
                       element={<EmbeddingDetectionResultPage/>}/>
                <Route path="/result/:resultId/*"
                       element={<EmbeddedFileDetailsPage/>}/>
              </Routes>
            </BrowserRouter>
          </Content>
          <Footer className="App-footer">Footer</Footer>
        </Layout>
    );
  }
}

export default App;
