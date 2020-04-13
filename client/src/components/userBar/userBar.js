import React,{Component} from "react";
import "./userBar.scss";
import _ from "lodash";
import avatar from "../images/avatar.png";
import UserForm from "../userForm/userForm";
import UserMenu from "../userMenu/userMenu";

class UserBar extends Component {
    constructor(props){
        super(props);
        this.state={
            showUserForm:false,
            showUserMenu:false,
        }

    }

    
    render(){

        const {store} = this.props;
        const me = store.getCurrentUser();
        const profilePicture = _.get(me,"avatar");

        return(
            <div className="user-bar">
                {!me ? <button className="login-button" onClick={()=>this.setState({showUserForm:true})}>Sign In</button> : null}

                <div className="profile-name">{_.get(me,"name")}</div>
                <div className="profile-image" onClick={()=>this.setState({showUserMenu:true})} ><img src={profilePicture ? profilePicture : avatar} alt="Profile Pic"></img></div>

                {!me && this.state.showUserForm ? <UserForm onClose={()=>this.setState({showUserForm:false})} store={store} /> : null}

                {this.state.showUserMenu ? <UserMenu onClose={()=>this.setState({showUserMenu:false})} store={store}/> : null}

            </div>
        )
    }
}

export default UserBar;
