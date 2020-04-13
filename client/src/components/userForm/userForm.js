import React,{Component} from "react";
import "./userForm.scss";
import classNames from "classnames";
import _ from "lodash";

class UserForm extends Component {

    constructor(props){
        super(props);
        this.state = {
            message:null,
            email:"",
            password:"",
        }

        this.onSubmit = this.onSubmit.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.onClickOutside = this.onClickOutside.bind(this);
    };

    onClickOutside(event){
        if(this.ref && !this.ref.contains(event.target)){
            if(this.props.onClose){
                this.props.onClose();
            }
        }
    };

    componentDidMount(){
        window.addEventListener("mousedown",this.onClickOutside);
    }

    componentWillUnmount(){
        window.removeEventListener("mousedown",this.onClickOutside);
    }

    onSubmit(event){
        const {store} = this.props
        event.preventDefault();

        this.setState({
            message:null,
        })

        const user = {
            email:this.state.email,
            password:this.state.password,
        }

        if(user.email && user.password){
            store.login(user.email, user.password)
            .then(user => {

                if(this.props.onClose){
                    this.props.onClose();
                }
                this.setState({
                    message:null,
                })
            }).catch(err => {
                console.log(err);
                this.setState({
                    message:{
                        body:err,
                        type:"error",
                    }
                })
            }) 
        }

    }

    handleChange(event){
        this.setState({[event.target.name]:event.target.value})
    }

    render(){

        const {message} = this.state;

        return(
            <div className="user-form" ref={(ref) => this.ref = ref }>
                <form method="POST">
                    {message ?<p className={classNames('app-message', _.get(message,"type"))}>{_.get(message, "body")}</p> : null}
                    <div className="form-item">
                        <label>Email</label>
                        <input type="email" name="email" value={this.state.email} onChange={this.handleChange} placeholder="Email Address"></input>
                    </div>
                    <div className="form-item">
                        <label>Password</label>
                        <input type="password" name="password" value={this.state.password} onChange={this.handleChange} placeholder="Password"></input>
                    </div>
                    <div className="form-action">
                        <button type="button">Create an Account?</button>
                        <button className="primary" type="sumbit" onClick={this.onSubmit}>Sign In</button>
                    </div>
                </form>
            </div>
        )
    }
}

export default UserForm;