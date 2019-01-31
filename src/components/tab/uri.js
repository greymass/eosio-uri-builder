import React, { Component } from 'react';

import {
  Button,
  Dropdown,
  Form,
  Header,
  Segment,
} from 'semantic-ui-react';

import ReactJson from 'react-json-view';
import Highlight, { defaultProps } from "prism-react-renderer";

const exampleCode = `
(function someDemo() {
  var test = "Hello World!";
  console.log(test);
})();

return () => <App />;
`;


class TabURI extends Component {
  render() {
    const {
      uri,
      tx,
    } = this.props;
    return (
      <Segment attached>
        <Header>
          URI Generated:
          <Header.Subheader style={{ marginTop: '0.5em' }}>
            <a href={uri} target="_blank">
              {uri}
            </a>
          </Header.Subheader>
        </Header>
        <Highlight {...defaultProps} code={exampleCode} language="jsx">
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={style}>
              {tokens.map((line, i) => (
                <div {...getLineProps({ line, key: i })}>
                  {line.map((token, key) => (
                    <span {...getTokenProps({ token, key })} />
                  ))}
                </div>
              ))}
            </pre>
          )}
        </Highlight>
        <Header size="small">
          URI Transaction:
        </Header>
        <ReactJson
          displayDataTypes={false}
          displayObjectSize={false}
          iconStyle="square"
          name={null}
          src={tx}
          style={{ padding: '1em' }}
          theme="harmonic"
        />
      </Segment>
    );
  }
}

export default TabURI;
