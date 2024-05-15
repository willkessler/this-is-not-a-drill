import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import AceEditor from 'react-ace';
import { useSdkConfiguration } from './configuratorContext';
import { Tabs, rem } from '@mantine/core';
import 'ace-builds/src-noconflict/mode-javascript';
import 'ace-builds/src-noconflict/theme-github';
import 'ace-builds/src-noconflict/theme-monokai';

//import { TargetInsertType, SDKConfiguration } from '../../../vanillajs/src/types';

type FileData = {
  filename: string;
  content: string;
};


const TabbedEditor: React.FC = () => {
  const { getSdkConfiguration, 
          setSdkConfiguration, 
          getCustomCss,
          setCustomCss,
          getFilteredSdkConfiguration, 
          configurationChanged, 
          setConfigurationChanged,
          activeTab,
          setActiveTab,
  } = useSdkConfiguration();

  const [editorHeight, setEditorHeight ] = useState('400px');
  const initialFiles: FileData[] = [
    { filename: 'snippet.js', content: `//\n// SDK Initialization Code\n//\n\nconst sdk = initializeSDK(${JSON.stringify(getFilteredSdkConfiguration(), null, 2)});` },
    { filename: 'custom.css', content: "\n\nconsole.log('Hello from file 2');\n" }
  ];
  const [files, setFiles] = useState<FileData[]>(initialFiles);

  const updateSampleAppCss = (newCss: string) => {
    const bankIframe = document.getElementById('bank-app') as HTMLIFrameElement;
    if (bankIframe && bankIframe.contentWindow) {
      const newConfigMessage = {
        name: 'updateCss',
        css: newCss,
      };
      const messageString = JSON.stringify(newConfigMessage);
      bankIframe.contentWindow.postMessage(messageString, window.location.origin);
    }
  }

  const updateFiles = (file1:FileData, file2: FileData):void => {
    const introPrefix =  "//\n// AUTO-GENERATED SCRIPT TAG\n" +
                         "// The configuration controls at left\n" +
                         "// update the script tag below.\n" +
                         "// To go live, simply embed a snippet like this\n" +
                         "// (along your API key) on your site/app.\n" +
                         "//\n\n" +
`<script 
  id="tinad-sdk"
  src="http://localhost:3500/bundle.js"
  tinad-configuration=
'`;    
    const currentConfig = file1.content;
    //console.log(`currentconfig: ${JSON.stringify(currentConfig,null,2)}`);
    const configStringified = JSON.stringify(currentConfig, null,2);
    const editorContents = introPrefix + configStringified + "'\n>\n\n";
    const currentCustomCss = file2.content;
    setFiles(
      [
        { filename: file1.filename, content: editorContents },
        { filename: file2.filename, content: currentCustomCss }
      ]
    );

  }
  
  const fetchCustomCss = async ():void => {
    try {
      const cssUrl = '/bank.css';
      const response = await fetch(cssUrl);
      const rawCss = await response.text();
      const finalCss = "/*\n * Edit the CSS below to see how to\n * customize the inline notification's styles.\n*/\n" + rawCss;
      setCustomCss(finalCss);
      updateFiles(
        { filename: 'snippet.js', content: getSdkConfiguration() },
        { filename: 'custom.css', content: getCustomCss() },
      );
    } catch(error) {
      console.log(`Cannot fetch custom css: ${error}`);
    }
  }

  useEffect(() => {
    fetchCustomCss();
  }, []);

  useLayoutEffect(() => {
    const calculateHeight = () => {
      setTimeout(() => {
        const codeEditorElement = document.getElementById('code-editor');
        const totalHeight = codeEditorElement.clientHeight;
        const tabsElement = document.getElementById('editor-tabs');
        const tabHeight = tabsElement.clientHeight;
        console.log(`calculated heights: total: ${totalHeight} tabs: ${tabHeight}`);
        setEditorHeight(`${totalHeight - tabHeight}px`);
      },0);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);
    return () => {
      window.removeEventListener('resize', calculateHeight);
    }
  }, []);
  
  useEffect(() => {
    updateFiles( 
      { filename: 'snippet.js', content: getFilteredSdkConfiguration() },
      { filename: 'custom.css', content: getCustomCss() }
    );
    setConfigurationChanged(false);
  }, [configurationChanged]);
  
  const handleEditorChange = (newContent: string, index: number) => {
    if (index === 1) {
      console.log('Updating bank app CSS.');
      setCustomCss(newContent);
      updateSampleAppCss(newContent);
    }
    setFiles(currentFiles =>
      currentFiles.map((file, idx) => ({
        ...file,
        content: idx === index ? newContent : file.content
      }))
    );
  };

  return (
    <div id="editors-container" className="editors-container">
      <Tabs
        variant="outline" value={activeTab} onChange={setActiveTab} orientation="horizontal" style={{ height: '100%' }}>
        <Tabs.List id="editor-tabs">
          {files.map((file, index) => (
            <Tabs.Tab 
              key={file.filename} 
              value={file.filename}
              style={{ fontWeight: activeTab === file.filename ? 'bold' : 'normal', 
                       color: activeTab === file.filename ? '#eee' : '#666' }}
            >
              {file.filename}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {files.map((file, index) => (
          <Tabs.Panel key={file.filename} value={file.filename} 
            style={{flex:1, minHeight: 0, height:'100%', position:'relative', overflow:'auto'}}>
            <AceEditor
              mode="javascript"
              theme="monokai"
              value={files[index].content}
              onChange={(newContent) => handleEditorChange(newContent, index)}
              name={`editor_${index}`}
              fontSize={16}
              fontFamily="Arial"
              tabSize={2}
              showPrintMargin={false}
              editorProps={{ $blockScrolling: true }}
              width="100%"
              height={editorHeight}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </div>
  );
};

export default TabbedEditor;
