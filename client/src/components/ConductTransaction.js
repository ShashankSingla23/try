import React, { Component } from "react";
import { FormGroup, FormControl,Button } from "react-bootstrap";
import { Link,Redirect } from "react-router-dom";
import history from '../history';

class ConductTransaction extends Component {
  state = { recipient: "", amount: 0,redirect:false };

  updateRecipient = (event) => {
    this.setState({ recipient: event.target.value });
  };

  updateAmount = (event) => {
    this.setState({ amount: Number(event.target.value) });
  };

 conductTransaction =()=>{
     const {recipient,amount}=this.state;

     fetch(`${document.location.origin}/api/transact`,{
         method: 'POST',
         headers:{'Content-Type':'application/json'},
         body: JSON.stringify({recipient,amount})
     }).then(response=>response.json())
     .then(json=>{
         alert(json.message || json.type);
      //  this.state.redirect=true;
     })
     .catch(err=>console.log(err))
 }

  render() {

    //console.log('This State: ',this.state);
    // if(this.state.redirect){
    //      return <Redirect to='/transaction-pool'/>
    // }
    return (
      <div className="ConductTransaction">
        <Link to="/">Home</Link>
        <h3>Conduct a Transaction</h3>
        <FormGroup>
          <FormControl
            input="text"
            placeholder="recipient"
            value={this.state.recipient}
            onChange={this.updateRecipient}
          />
        </FormGroup>
        <FormGroup>
          <FormControl
            input="number"
            placeholder="amount"
            value={this.state.amount}
            onChange={this.updateAmount}
          />
        </FormGroup>
        <div><Button varient='danger' onClick={this.conductTransaction}>Submit</Button></div>
        
      </div>
    );
  }
}

export default ConductTransaction;