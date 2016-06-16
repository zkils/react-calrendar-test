/**
 * Created by krinjadl on 2016-06-14.
 */
import React from 'react';
import styles from './css/Content.css';
import GoogleLogin from './GoogleLogin';

class Content extends React.Component{
    constructor(props){
        super(props);
        this.state ={
            isGoogleLogin:false,
        }
    }
    responseGoogle(response) {
        if(response["code"]){
            this.setState({
                isGoogleLogin:true
            })
            this.props.onUpdateTitle("Calrendar - Weekly Schedule");
            this.props.onUpdateSettingBtnStatus(this.state.isGoogleLogin);
        }

    }
    render(){
        if(!this.state.isGoogleLogin) {
            return (
                <div className={styles.contentBody}>
                    <GoogleLogin
                        clientId="949034064011-7os3b956vkm8l6fit0frkhjc0ak523hn.apps.googleusercontent.com"
                        buttonText="Login with Google+"
                        callback={this.responseGoogle.bind(this)}
                    />
                </div>
            )
        }else{
            return(
                <div className={styles.contentBody}>
                    Google Login success!
                </div>
            )
        }
    };
}

Content.propTypes = {
    title : React.PropTypes.string,
}

export default Content