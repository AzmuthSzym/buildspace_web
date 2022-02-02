import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import "./App.css";
import abi from "./utils/WavePortal.json"

const App = () => {
  /*
  * Just a state variable we use to store our user's public wallet.
  */
  const [currentAccount, setCurrentAccount] = useState("");
  const [allWaves, setAllWaves] = useState([]);
  const contractAddress = "CONTRACT_ADDRESS";
  const contractABI = abi.abi;
  
  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Make sure you have metamask!");
        return;
      } else {
        console.log("We have the ethereum object", ethereum);
      }

      /*
      * Check if we're authorized to access the user's wallet
      */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Found an authorized account:", account);
        setCurrentAccount(account)
      } else {
        console.log("No authorized account found")
      }
    } catch (error) {
      console.log(error);
    }
  }

  const connectWallet = async () => {
    try {
      const {ethereum} = window;

      if(!ethereum) {
        alert("Get Metamask wallet!");
      }

      const accounts = await ethereum.request({ method: "eth_requestAccounts" });

      console.log("Connected", accounts[0]);
      setCurrentAccount(accounts[0]);
    }
    catch(error) {
      console.log(error);
    }
  }

  const wave = async () => {
    let msg_text = document.getElementById("message_text").value;
    if(msg_text === '')
    {
      alert("Message can't be empty")
    }    
    else{
      try {
        const {ethereum} = window;

        if(ethereum) {
          const provider = new ethers.providers.Web3Provider(ethereum);
          const signer = provider.getSigner();
          const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

          let count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count... %d", count.toNumber());
          //dd
          const waveTxn = await wavePortalContract.wave(msg_text);
          console.log("Mining ...", waveTxn.hash);

          await waveTxn.wait();
          console.log("Mined --", waveTxn.hash);

          count = await wavePortalContract.getTotalWaves();
          console.log("Retrieved total wave count...", count.toNumber());
          countWaves();
          getAllWaves();
        }
        else {
          console.log("Ethereum object doesn't exist!")
        }
      }
      catch(error) {
        console.log(error)
      }
    }
  }

  const countWaves = async () => {
    try {
      const {ethereum} = window;

      if(ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);

        let count = await wavePortalContract.getTotalWaves();
        console.log("Retrieved total wave count... %d", count.toNumber());
        //document.getElementById("waves").innerHTML = "This is the amount of time someone waved: " + count;
      }
      else {
        console.log("Ethereum object doesn't exist!")
      }      
    }
    catch(error) {
      console.log(error);
    }
  }
  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  
  const getAllWaves = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const wavePortalContract = new ethers.Contract(contractAddress, contractABI, signer);
        const waves = await wavePortalContract.getAllWaves();

        let wavesCleaned = [];
        waves.forEach(wave => {
          wavesCleaned.push({
            address: wave.waver,
            timestamp: new Date(wave.timestamp * 1000),
            message: wave.message
          });
        });

        /*
         * Store our data in React State
         */
        setAllWaves(wavesCleaned);
      } else {
        console.log("Ethereum object doesn't exist!")
      }
    } catch (error) {
      console.log(error);
    }
  }

  window.onload = function () {
    //document.getElementById("headerek").innerHTML="No siema";
    getAllWaves();
  }

  return (
    <div className="mainContainer">
      <div className="dataContainer">
        <div className="header" id="headerek">
          <span role="img" aria-labelledby="hand">👋</span> Hey there!
        </div>

        <div className="bio">
          Hi! Connect your Ethereum wallet and send message at me!
        </div>

        <div id="waves2">
          <input type="text" id="message_text" />
        </div>        

        <button className="waveButton" onClick={wave}>
          Send Message
        </button>

        {!currentAccount && (
          <button className="connectButton" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}

        {allWaves.map((wave, index) => {
          return (
            <div key={index} style={{ backgroundColor: "OldLace", marginTop: "16px", padding: "8px" }}>
              <div>Address: {wave.address}</div>
              <div>Time: {wave.timestamp.toString()}</div>
              <div>Message: {wave.message}</div>
            </div>)
        })}
      </div>
    </div>
    );
  }
export default App