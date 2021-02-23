import React, { Component } from "react";
import {Button} from 'react-bootstrap';
import { Link,Redirect } from "react-router-dom";
import Transaction from "./Transaction";
//import history from '../history'

const POLL_INTERVAL_MS=10000;

class TransactionPool extends Component{
    state={transactionPoolMap:{}}

    fetchTransactionPoolMap=()=>{
        fetch(`${document.location.origin}/api/transaction-pool-map`)
        .then(response=>response.json())
        .then(json=>this.setState({transactionPoolMap:json}))
        .catch(err=>console.log(err))
    }

    fetchMineTransaction=()=>{
        fetch(`${document.location.origin}/api/mine-transactions`)
        .then(response => {
            if(response.statuse===2000){
                alert('success');
               // <Redirect to='./blocks'/>
            }
            else{
                alert('the mine-transaction block request did not complete');
            }
        });
    }

    componentDidMount(){
        this.fetchTransactionPoolMap();
        this.fetchPoolMapInterval=setInterval(
            () =>this.fetchTransactionPoolMap(),POLL_INTERVAL_MS
        )
    }

    componentWillUnmount(){
        clearInterval(this.fetchPoolMapInterval);
    }


    render(){
        return(
            <div className='TransactionPool'>
                <div><Link to='/'>Home</Link></div>
                <h3>Transaction Pool</h3>
                {
                    Object.values(this.state.transactionPoolMap).map(transaction =>{
                        return(
                            <div key={transaction.id}>
                                <hr color='white'></hr>
                                <Transaction transaction={transaction}/>
                            </div>
                        )
                    })
                }
                <hr color='white'></hr>
                <Button varient='danger' onClick={this.fetchMineTransaction} >Mine the Transaction</Button> 
            </div>
        )
    }
}

export default TransactionPool;