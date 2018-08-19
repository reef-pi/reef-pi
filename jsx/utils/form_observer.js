import React, { Component } from 'react';
import debounce from 'lodash.debounce';
import isEqual from 'lodash.isequal';
import PropTypes from 'prop-types';

export default class extends Component {
  static defaultProps = {
    debounce: 16,
    onChange: () => null
  };

  static contextTypes = {
    formik: PropTypes.object
  };

  onChange = debounce(next => this.props.onChange(next), this.props.debounce);

  componentWillReceiveProps(nextProps, nextContext) {
    if (!isEqual(nextContext.formik, this.context.formik)) {
      this.onChange(nextContext.formik);
    }
  }

  render() {
    return null;
  }
}