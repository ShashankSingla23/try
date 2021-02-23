import React from 'react';
import {render} from 'react-dom';
import {BrowserRouter,Router,Switch,Route,Redirect} from 'react-router-dom';
import App from './components/App';
//import history from './history';
import Blocks from './components/Blocks';
import ConductTransaction from './components/ConductTransaction';
import './index.css';
import TransactionPool from './components/TransactionPool';
//history={history}
render(
    <BrowserRouter >
    <Switch>
        <Route exact path='/' component ={App}/>
        <Route exact path='/blocks' component={Blocks}/>
        <Route exact path='/conduct-transaction' component={ConductTransaction}/>
        <Route exact path='/transaction-pool' component={TransactionPool}/>
        <Redirect from='/conduct-transaction' to ='/transaction-pool'/>
    </Switch>
    </BrowserRouter>
    ,document.getElementById('root'));