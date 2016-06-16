/**
 * Created by krinjadl on 2016-06-15.
 */
import React from 'react';

class TextBox extends React.Component{
    constructor(props){
        super(props);
    }
    shouldComponentUpdate(nextProps, nextState){
        return (JSON.stringify(nextProps) != JSON.stringify(this.props));
    }
    _handleChange(){
        this.props.onChange();
    }
    render(){
        return (
            <div className={this.props.className} onChange={this._handleChange.bind(this)}>{this.props.tbText}</div>
        );
    }
}

export default TextBox