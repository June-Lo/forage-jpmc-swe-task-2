import React, { Component } from 'react';
import { Table } from '@finos/perspective';
import { ServerRespond } from './DataStreamer';
import './Graph.css';

/**
 * Props declaration for <Graph />
 */
interface IProps {
  data: ServerRespond[];
}

/**
 * Perspective library adds load to HTMLElement prototype.
 * This interface acts as a wrapper for Typescript compiler.
 */
interface PerspectiveViewerElement extends HTMLElement {
  load: (table: Table) => void;
  'view': string;
  'column-pivots': string;
  'row-pivots': string;
  'columns': string;
  'aggregates': string;
  [key: string]: any; // Add an index signature to allow any string property
}

/**
 * React component that renders Perspective based on data
 * parsed from its parent through the data property.
 */
class Graph extends Component<IProps, {}> {
  // Perspective table
  private table: Table | undefined;

  componentDidMount() {
    // Get element to attach the table from the DOM.
    const elem = document.getElementsByTagName('perspective-viewer')[0] as PerspectiveViewerElement;

    const schema = {
      stock: 'string',
      top_ask_price: 'float',
      top_bid_price: 'float',
      timestamp: 'date',
    };

    if (window.perspective && window.perspective.worker()) {
      this.table = window.perspective.worker().table(schema);
    }

    if (this.table) {
      // Load the `table` in the `<perspective-viewer>` DOM reference.
      elem.load(this.table);

      // Add more Perspective configurations here.
      elem.view = 'y_line';
      elem['column-pivots'] = '["stock"]';
      elem['row-pivots'] = '["timestamp"]';
      elem.columns = '["top_ask_price"]';
      elem.aggregates = '{"top_ask_price":"avg"}'; // Adjust the aggregate function if needed
    }
  }

  componentDidUpdate(prevProps: IProps) {
    // Every time the data props are updated, insert the data into the Perspective table
    if (this.table && this.props.data !== prevProps.data) {
      // Only update the table if the data has changed to avoid duplicates
      this.table.update(
        this.props.data.map((el: any) => {
          // Format the data from ServerRespond to the schema
          return {
            stock: el.stock,
            top_ask_price: el.top_ask && el.top_ask.price || 0,
            top_bid_price: el.top_bid && el.top_bid.price || 0,
            timestamp: el.timestamp,
          };
        })
      );
    }
  }

  render() {
    return React.createElement('perspective-viewer');
  }
}

export default Graph;
