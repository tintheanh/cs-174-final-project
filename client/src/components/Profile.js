import React, { Component } from 'react'
import { Redirect } from 'react-router-dom';
import jwt_decode from 'jwt-decode'

class Profile extends Component {
  state = {username: ''}

  componentDidMount() {
    if (localStorage.usertoken) {
      const token = localStorage.usertoken
      const decoded = jwt_decode(token)
      this.setState({ username: decoded.username })
    }
  }

  render() {
    if (!localStorage.usertoken) return <Redirect to="/" />
    return (
      <div className="container">
        <h1>{`Welcome ${this.state.username}`}</h1>
      </div>
    )
  }
}

export default Profile
