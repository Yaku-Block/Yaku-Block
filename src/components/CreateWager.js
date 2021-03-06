import React, { Component } from "react";
import factory from "../ether/factory";
import web3 from "../ether/web3";
import { withRouter } from "react-router-dom";
import { db } from "../fire/firestore";
import "./App.css";
import { connect } from "react-redux";
import NavBar from "./NavBar";
import HomeButton from "./HomeButton";
import { Segment, Button, Form, Input, Message } from "semantic-ui-react";


class CreateWager extends Component {
  constructor(props) {
    super(props);
    this.state = {
      minimumBet: "",
      errorMessage: "",
      loading: false,
      leftSide: "",
      rightSide: "",
      description: "",
      currentUser: this.props.currentUser,
      imageURL: ""
    };
    this.goHome = this.goHome.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  goHome = event => {
    event.preventDefault();
    this.props.history.push("/wagers");
  };

  componentDidMount() {
    if (this.props.location.state && this.props.location.state.time) {
      const desc =
        "Game between " +
        this.props.location.state.away +
        " at " +
        this.props.location.state.home +
        " to be played on " +
        this.props.location.state.date +
        " at " +
        this.props.location.state.time;
      this.setState({
        leftSide: this.props.location.state.away,
        rightSide: this.props.location.state.home,
        description: desc,
        imageURL: this.props.location.state.logo
      });
    }

    else if (this.props.location.state){
      const desc =
        "Game between " +
        this.props.location.state.away +
        " at " +
        this.props.location.state.home +
        " to be played on " +
        this.props.location.state.date
      this.setState({
        leftSide: this.props.location.state.away,
        rightSide: this.props.location.state.home,
        description: desc,
        imageURL: this.props.location.state.logo
      });
    }
  }

  onSubmit = async event => {
    event.preventDefault();

    this.setState({ loading: true, errorMessage: "" });

    try {
      const accounts = await web3.eth.getAccounts();
      await factory.methods
        .createWager(
          this.state.minimumBet,
          this.state.leftSide + " vs. " + this.state.rightSide,
          this.state.description,
          this.state.imageURL
        )
        .send({
          from: accounts[0]
        });


      this.props.history.push("/wagers");
    } catch (err) {
      this.setState({ errorMessage: err.message });
    }

    const wagerName = this.state.leftSide + " vs. " + this.state.rightSide;

    db
      .collection("wagers")
      .doc(wagerName)
      .collection("image")
      .add({
        imageURL: this.state.imageURL
      });

    this.setState({ loading: false });
  };

  render() {
    let desc = "";
    let loading = this.state.loading ? "loading" : "loading-false";

    if (this.props.currentUser) {
      return (
        <div>
          <div id={loading} className="ui active dimmer">
            <div className="ui large text loader">
              <p className="loading-text">
                This Honestly Takes A Long Time! Be Patient! Don't Leave The
                Page!
              </p>
            </div>
          </div>
          <div className={`App`}>
            <Segment inverted textAlign="center">
              <NavBar message={"Create a Weijr For All"} />
              <HomeButton goHome={this.goHome} />
            </Segment>

              <Form
              style={{margin:0}}
              id="new-form"
                textAlign="center"
                className="createWager"
                onSubmit={this.onSubmit}
                error={!!this.state.errorMessage}
              >
              <div className="field-container">
                <Form.Field className="form-field">
                  <h3>What's The Name Of Your Wagr</h3>
                  <div className="fields">
                    <div className="side-bet">
                      <div className="fifteen wide field">
                        <Input
                          value={this.state.leftSide}
                          onChange={event =>
                            this.setState({ leftSide: event.target.value })
                          }
                          label="Side One"
                          labelPosition="left"
                          required
                          className="side-input"
                        />
                      </div>
                      <label className="large text">Vs.</label>
                      <div className="fifteen wide field">
                        <Input
                          value={this.state.rightSide}
                          onChange={event =>
                            this.setState({ rightSide: event.target.value })
                          }
                          label="Side Two"
                          labelPosition="right"
                          required
                        />
                      </div>
                    </div>
                  </div>
                </Form.Field>
                <Form.Field className="form-field">
                  <h4>How much do you want the buy in to be?</h4>
                  <Input
                    value={this.state.minimumBet}
                    onChange={event =>
                      this.setState({ minimumBet: event.target.value })
                    }
                    label="ether"
                    labelPosition="right"
                    required
                  />
                </Form.Field>
                <Form.Field className="form-field">
                  <label>Describe What Your Wagr Is Going To Be Below!</label>
                  <textarea
                    rows="2"
                    value={desc || this.state.description}
                    onChange={event =>
                      this.setState({ description: event.target.value })
                    }
                    label="description"
                    labelPosition="right"
                    required
                  />
                </Form.Field>
                <Form.Field className="form-field">
                  <label>Provide an image URL:</label>
                  <Input
                    value={this.state.imageURL}
                    onChange={event =>
                      this.setState({ imageURL: event.target.value })
                    }
                    labelPosition="right"
                  />
                </Form.Field>
                <Message
                  error
                  header="Oops!"
                  content={this.state.errorMessage}
                />
                <div className="form-field">
                  <Button primary>Create!</Button>
                </div>
                </div>
              </Form>

          </div>
        </div>
      );
    } else {
      this.props.history.push("/");
      return null;
    }
  }
}

const mapStateToProps = function(state, ownProps) {
  return {
    currentUser: state.user
  };
};

export default withRouter(connect(mapStateToProps, null)(CreateWager));
