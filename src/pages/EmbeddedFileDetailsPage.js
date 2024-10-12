import {Breadcrumb} from "antd";
import {useState} from "react";
import {useLocation, useParams} from "react-router-dom";

import {eel} from "../eel";
import {EmbeddedFile, EmbeddingDetectionResult, LoadState} from "../types";
import {EmbeddedFileList} from "../components/EmbeddedFileList";

export function EmbeddedFileDetailsPage() {
  const [state: LoadState, setState] = useState({state: 'loading'});
  const [file: EmbeddedFile, setFile] = useState(null);

  let location = useLocation();
  let nestedPath = location.pathname.replace(/^\/result\/[^\/]+\//, '');

  let {resultId} = useParams();
  const nestedPathParts = nestedPath.split("/");
  const nestedPathPartLinks = [resultId, ...nestedPathParts].map((part, index, array) => {
    const nestedPath = array.slice(0, index + 1).join('/');
    return {
      "title":
          index === array.length - 1 ? part :
              <a href={"/result/" + nestedPath}>{part}</a>,
    }
  });

  function loadData() {
    // noinspection JSUnresolvedReference
    eel.fetchEmbeddingDetectionResultById(resultId)(
        function (result) {
          setFile(EmbeddingDetectionResult.fromObject(result).locate(nestedPathParts));
          setState({state: 'loaded'});
        },
        function (error) {
          setState({state: 'error', error: error});
        }
    );
  }

  if (state.state !== 'loaded') {
    loadData();
  }

  return (
      <div>
        {
            state.state === 'loaded' &&
            <div>
              <Breadcrumb items={[
                {'title': <a href="/">Home</a>},
                ...nestedPathPartLinks
              ]}/>
              <p>Embedded File Details</p>
              <EmbeddedFileList files={file.embeddedFiles}
                                nestedPath={resultId + "/" + nestedPath}/>
            </div>
        }
      </div>
  )
}