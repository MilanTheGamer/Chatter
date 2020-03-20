import React,{Component} from "react";
import "./searchUser.scss";
import _ from "lodash";


class SearchUser extends Component{
    constructor(props){
        super(props);

        this.handleOnClick = this.handleOnClick.bind(this);
    }

    handleOnClick(user){
        if(this.props.onSelect){
            this.props.onSelect(user);
        }
    }

    render(){

        const {store,search} = this.props;
        const users = store.searchUsers(search)
        return(
            <div className="search-user">
                <div className="user-list">
                    {users.map((user)=>{
                        return(
                            <div onClick={() => this.handleOnClick(user)} key={user._id} className="user">
                                <img src={user.avatar} alt="altImg"></img>
                                <h2>{user.name}</h2>
                            </div>
                        )
                    })}
                </div>
            </div>
        )
    }
}

export default SearchUser;