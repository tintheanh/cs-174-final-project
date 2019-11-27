import React, { Component } from 'react'
import { Link, withRouter } from 'react-router-dom'

import { logout } from '../utils/auth';

class NavBar extends Component {
  logOut = () => {
    logout(() => this.props.history.push('/'));
  }

  render() {
    const loginRegLink = (
      <ul>
        <li>
          <Link to="/login">
            Login
          </Link>
        </li>
        <li>
          <Link to="/register">
            Register
          </Link>
        </li>
      </ul>
    )

    const userLink = (
      <ul className="navbar-nav">
        <li>
          <Link to="/profile">
            Profile
          </Link>
        </li>
        <li className="nav-item">
          <a href="" onClick={this.logOut}>
            Logout
          </a>
        </li>
      </ul>
    )

    return (
      <nav>
        <div>
          <ul className="navbar-nav">
            <li className="nav-item">
              <Link to="/">
                Home
              </Link>
            </li>
          </ul>
          {localStorage.usertoken ? userLink : loginRegLink}
        </div>
      </nav>
    )
  }
}

export default withRouter(NavBar)
