import React, { useRef, useEffect } from 'react';
import { WebView } from 'react-native-webview';
import { View, StyleSheet, ActivityIndicator } from 'react-native';


interface CodeMirrorWebViewProps {
  code: string;
  language: string;
  onChange: (code: string) => void;
}

/**
 * CodeMirror 6를 WebView로 통합한 컴포넌트
 * 미래지향적인 사이버펑크 테마 적용
 */
export const CodeMirrorWebView: React.FC<CodeMirrorWebViewProps> = ({
  code,
  language,
  onChange,
}) => {
  const webViewRef = useRef<WebView>(null);


  // CodeMirror HTML 템플릿 (사이버펑크 테마)
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      margin: 0;
      padding: 0;
      background: #0d1117;
      font-family: 'Orbitron', monospace;
      overflow: hidden;
    }
    #editor {
      height: 100vh;
      width: 100vw;
    }
    .cm-editor {
      height: 100%;
      font-size: 14px;
      font-family: 'Orbitron', monospace;
    }
    .cm-scroller {
      overflow: auto;
    }
    .cm-focused {
      outline: none;
    }
    /* 사이버펑크 테마 스타일 */
    .cm-editor.cm-focused {
      outline: 1px solid #00ffff;
      outline-offset: -1px;
    }
    .cm-line {
      color: #c9d1d9;
      line-height: 1.6;
    }
    .cm-content {
      padding: 16px;
    }
    /* 키워드 (네온 블루) */
    .cm-keyword { color: #00ffff; text-shadow: 0 0 5px #00ffff; }
    /* 문자열 (네온 그린) */
    .cm-string { color: #00ff00; text-shadow: 0 0 5px #00ff00; }
    /* 숫자 (네온 옐로우) */
    .cm-number { color: #ffff00; text-shadow: 0 0 5px #ffff00; }
    /* 주석 (다크 그레이) */
    .cm-comment { color: #6e7681; font-style: italic; }
    /* 함수 (네온 마젠타) */
    .cm-function { color: #ff00ff; text-shadow: 0 0 5px #ff00ff; }
    /* 변수 (사이안) */
    .cm-variable { color: #00d9ff; }
    /* 타입 (오렌지) */
    .cm-type { color: #ff8800; }
    /* 라인 번호 */
    .cm-lineNumbers .cm-gutterElement {
      color: #6e7681;
      min-width: 40px;
      text-align: right;
      padding-right: 16px;
    }
    /* 선택 영역 */
    .cm-selectionBackground {
      background: rgba(0, 255, 255, 0.2);
    }
    /* 커서 */
    .cm-cursor {
      border-left: 2px solid #00ffff;
      box-shadow: 0 0 10px #00ffff;
    }
  </style>
</head>
<body>
  <div id="editor"></div>
  <script src="https://cdn.jsdelivr.net/npm/@codemirror/state@6.2.1/dist/index.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@codemirror/view@6.21.0/dist/index.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@codemirror/lang-cpp@6.0.2/dist/index.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/@codemirror/basic-setup@0.20.0/dist/index.js"></script>
  <script>
    (function() {
      const { EditorView, basicSetup } = CM;
      const { cpp } = CM_cpp;
      const { EditorState } = CM_state;
      
      let editor = null;
      let currentCode = ${JSON.stringify(code)};
      
      function initEditor() {
        const editorElement = document.getElementById('editor');
        
        editor = new EditorView({
          state: EditorState.create({
            doc: currentCode,
            extensions: [
              basicSetup,
              cpp(),
              EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                  const newCode = update.state.doc.toString();
                  currentCode = newCode;
                  // React Native로 코드 변경 전달
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'codeChange',
                    code: newCode
                  }));
                }
              }),
              EditorView.focusChangeEffect.of((state, focusing) => {
                if (focusing) {
                  // 포커스될 때 React Native에 알림
                  window.ReactNativeWebView.postMessage(JSON.stringify({
                    type: 'editorFocus'
                  }));
                }
                return null;
              }),
              EditorView.theme({
                '&': {
                  backgroundColor: '#0d1117',
                  color: '#c9d1d9',
                },
                '.cm-content': {
                  padding: '16px',
                },
                '.cm-focused': {
                  outline: '1px solid #00ffff',
                },
              }),
            ],
          }),
          parent: editorElement,
        });
      }
      
      // 초기화
      if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEditor);
      } else {
        initEditor();
      }
      
      // 메시지 리스너 (React Native에서 코드 업데이트)
      window.addEventListener('message', (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'updateCode' && editor) {
          const transaction = editor.state.update({
            changes: {
              from: 0,
              to: editor.state.doc.length,
              insert: data.code
            }
          });
          editor.dispatch(transaction);
        }
      });
    })();
  </script>
</body>
</html>
  `;

  // 코드 변경 시 WebView에 전달
  useEffect(() => {
    if (webViewRef.current) {
      webViewRef.current.postMessage(
        JSON.stringify({
          type: 'updateCode',
          code: code,
        })
      );
    }
  }, [code]);

  const handleMessage = (event: any) => {
    try {
      const data = JSON.parse(event.nativeEvent.data);
      if (data.type === 'codeChange') {
        onChange(data.code);
      } else if (data.type === 'editorFocus') {
        // WebView에서 포커스 이벤트를 감지했으므로
        // 각 플랫폼의 키보드 제어는 시스템이 자동으로 처리합니다
        console.log('[CodeMirror] Editor focused');
      }
    } catch (error) {
      console.error('WebView message error:', error);
    }
  };

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        style={styles.webview}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        startInLoadingState={true}
        keyboardDisplayRequiresUserAction={false}
        hideKeyboardAccessoryView={false}
        scrollEnabled={false}
        nestedScrollEnabled={false}
        androidLayerType="hardware"
        mixedContentMode="compatibility"
        textInteractionEnabled={true}
        allowsInlineMediaPlayback={true}
        setSupportMultipleWindows={false}
        overScrollMode="never"
        onTouchStart={() => {
          // WebView 터치 시 키보드가 자동으로 표시됩니다
        }}
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#00ffff" />
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d1117',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loading: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0d1117',
  },
});

