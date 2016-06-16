/**
 * Created by krinjadl on 2016-06-14.
 */
import React from 'react';
//import Hammer from 'react-hammerjs';
import styles from './css/Button.css';
import classNames from 'classnames';

class Button extends React.Component{

    constructor(props){
        super(props);
        this.state={
            cx : classNames(styles.obButton ,this.props.subClassName),
        }
    }
    shouldComponentUpdate(nextProps, nextState){
        return (JSON.stringify(nextProps) != JSON.stringify(this.props));
    }
    handleClick(){
        this.props.onClick();
    }
    handleHold(){
        this.setState({cx:classNames(styles.obButton ,this.props.subClassName,styles.obButtonDown)});
    }
    handleRelease(){
        this.setState({cx:classNames(styles.obButton ,this.props.subClassName)});
    }
    render(){
        console.log("render btn" + this.props.label);
        if(this.props.status){
            return(
                <button onClick={this.handleClick.bind(this)}
                        onMouseDown={this.handleHold.bind(this)}
                        onMouseUp={this.handleRelease.bind(this)}
                        onMouseOut={this.handleRelease.bind(this)}
                        className={ this.state.cx }>
                    {this.props.label}
                </button>
            )
        }else{
            return(
                <button
                    className={ classNames(styles.obButton ,this.props.subClassName, styles.obButtonDisabled) }>
                    {this.props.label}
                </button>
            )
        }
    }
};

Button.defaultProps = {
    label:'Button',
    subClassName:'',
    status:true,
    show:true,
    onClick:function(){}
}

export default Button
