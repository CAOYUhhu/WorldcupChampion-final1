import { useState, useEffect } from "react";
import styled from "styled-components";
import { ethers } from "ethers";
import Typography from "@mui/material/Typography";
import { throttle } from "lodash";
import Tooltip from "@mui/material/Tooltip";
import { Button,Input,Radio} from 'antd';
import { Col, Row } from 'antd';
import React from 'react';
import { formatUnits } from '@ethersproject/units';
import "@vetixy/circular-std";
import 'antd/dist/antd.css'
import web3e from "web3"



import { get, subscribe } from "../store";
import Container from "./Container";
import ConnectWallet, { connectWallet } from "./ConnectWallet";
import showMessage from "./showMessage";
import { padWidth } from "../utils";



const Head = styled.div`
  display: flex;
  
  align-items: center;
  color: white;
  @media only screen and (max-width: ${padWidth}) {
    flex-direction: column;
  }
`;

const MenuWrapper = styled.div`
  display: flex;
  justify-content: space-between;
  
  @media only screen and (max-width: ${padWidth}) {
    margin-bottom: 20px;
    flex-wrap: wrap;
    justify-content: center;
  }
`;

const MenuItemText = styled.span`
  cursor: pointer;
  :hover {
    font-weight: bold;
  }
`;

function MenuItem(props) {
  const elementId = props.elementId;
  return (
    <MenuItemText
      style={{ padding: "10px 20px" }}
      onClick={() => {
        if (elementId) {
          const ele = document.getElementById(elementId);
          ele.scrollIntoView({ behavior: "smooth" });
        }
        props.onClick && props.onClick();
      }}
    >
      {props.children}
    </MenuItemText>
  );
}

const ETHERSCAN_DOMAIN =
  process.env.NEXT_PUBLIC_CHAIN_ID === "1"
    ? "etherscan.io"
    : "goerli.etherscan.io"; //暂时替换成goerli

const Content = styled.div`
  max-width: 840px;
  margin: 0 auto 5% auto;
  strong {
    color: red;
  }
`;

const StyledMintButton = styled.div`
  display: inline-block;
  width: 140px;
  text-align: center;
  padding: 10px 10px;
  border: 2px solid #000;
  border-radius: 40px;
  color: black;
  background: #000;
  cursor: ${(props) => {
    return props.minting || props.disabled ? "not-allowed" : "pointer";
  }};
  opacity: ${(props) => {
    return props.minting || props.disabled ? 0.6 : 1;
  }};
`;


const StyledMintButtonWL = styled.div`
  display: inline-block;
  width: 180px;
  text-align: center;
  padding: 10px 10px;
  border: 2px solid #000;
  border-radius: 40px;
  color: black;
  background: #000;
  cursor: ${(props) => {
    return props.minting || props.disabled ? "not-allowed" : "pointer";
  }};
  opacity: ${(props) => {
    return props.minting || props.disabled ? 0.6 : 1;
  }};
`;

function MintSection() {
  const [status, setStatus] = useState("false");
  const [progress, setProgress] = useState(null);
  const [fullAddress, setFullAddress] = useState(null);
  const [numberMinted, setNumberMinted] = useState(0);
  const [mintAmount, setmintAmount]=useState(1);
  const [iswhitelist, setisWhitelist]=useState("false");
  
  const handleDecrement=()=>{
    if (mintAmount<=1) return;
    setmintAmount(mintAmount-1);
  }

  const handleIncrement=()=>{
    if (mintAmount>=2000) return;
    setmintAmount(mintAmount+1);
    
  }

  async function updateStatus() {
    const { contract } = await connectWallet();
 
    
    const status = await contract.publicSaleOpen();
    const progress = parseInt(await contract.totalSupply());
 
    setStatus(status.toString());
    
    setProgress(progress);
    // 在 mint 事件的时候更新数据
    const onMint = throttle(async () => {
      const status = await contract.publicSaleOpen();
      const progress = parseInt(await contract.totalSupply());
      
      setStatus(status.toString());
      setProgress(progress);
    }, 7290);
    contract.on("Transfer", onMint);
  }



  


  useEffect(() => {
    (async () => {
      
      const fullAddressInStore = get("fullAddress") || null;
      if (fullAddressInStore) {
        const { contract } = await connectWallet();
       
        const numberMinted = await contract.balanceOf(fullAddressInStore);
        let iswhitelisted;
      
        iswhitelisted=await contract.isWhitelist([
          0x59e7df5c1b1201b5c11f5500ac21dbb2a2767eae926f5719bfb649a127e2fb66,
          0xbb792628deb224e137348e2f5c00ee4e782f5b258cd59c15255b5614139282c8,
          0x7346b300817106c844ad4c8118493243e2346bd1ea0dae790853d098cc29f0c9,
          0x4bdf5d5c7a4f895dd7dc5983104e977fd905650e00ecdeac5a7f5214440200d9,
          0xd92a952d5de08f4b6bd4fe0b1cdb83c0cc0d54a34e87e3bf785165728639226b,
          0x12078aa3f1cee0861e7446d9aa6eac38a277111dfec08b45006bc6c205dccde9
      ]);
        setisWhitelist(iswhitelisted.toString())
        setNumberMinted(parseInt(numberMinted));
        setFullAddress(fullAddressInStore);
      }
      subscribe("fullAddress", async () => {
        const fullAddressInStore = get("fullAddress") || null;
        
        setFullAddress(fullAddressInStore);
        if (fullAddressInStore) {
          
          const { contract } = await connectWallet();
          const numberMinted = await contract.balanceOf(fullAddressInStore);
          setNumberMinted(parseInt(numberMinted));
          updateStatus();
        }
      });
    })();
  }, []);

  useEffect(() => {
    try {
      const fullAddressInStore = get("fullAddress") || null;
      if (fullAddressInStore) {
        updateStatus();
      }
    } catch (err) {
      showMessage({
        type: "error",
        title: "获取合约状态失败",
        body: err.message,
      });
    }
  }, []);

  async function refreshStatus() {
    const { contract } = await connectWallet();
    const numberMinted = await contract.balanceOf(fullAddress);
    setNumberMinted(parseInt(numberMinted));
  }

  let mintButton = (
    <StyledMintButton
      style={{
        background: "#eee",
        color: "#999",
        cursor: "not-allowed",
        width:'200px',
        fontSize: "20px"
      }}
    >
      Not Started
    </StyledMintButton>
  );
  let mintButtonWL = (
    <StyledMintButtonWL
      style={{
        background: "#eee",
        color: "#999",
        cursor: "not-allowed",
        width:'200px',
        fontSize: "20px"
      }}
    >
      Not Started
    </StyledMintButtonWL>
  );

  function MintButton(props) {
    const [minting, setMinting] = useState(false);
    
    return (
      <StyledMintButton
        disabled={!!props.disabled}
        minting={minting}
        onClick={async () => {
          if (minting || props.disabled) {
            return;
          }
          setMinting(true);
          try {
            const { signer, contract } = await connectWallet();
            
            const contractWithSigner = contract.connect(signer);
            let value
            let value0=mintAmount/10
            
              
            value = ethers.utils.parseEther(value0.toString())
              
          
            const tx = await contractWithSigner.mint(mintAmount, {
              value,
            });
            const response = await tx.wait();
            showMessage({
              type: "success",
              title: "Mint Succeded",
              body: (
                <div>
                  <a
                    href={`https://${ETHERSCAN_DOMAIN}/tx/${response.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Transaction Details
                  </a>
                  {" "}
                  
                  <a
                    href="https://opensea.io/collection/worldcupchampion"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Or View On Opensea
                  </a>
                  
                </div>
              ),
            });
          } catch (err) {
            showMessage({
              type: "error",
              title: "Mint Failed",
              body: err.message,
            });
          }
          props.onMinted && props.onMinted();
          setMinting(false);
        }}
        style={{
          background: 'White',
          fontWeight: "bold" ,
          fontSize:'18px',
          marginTop:'10px',
          marginLeft:'7px',
          ...props.style,
  
        }}
      >
        Public Mint {minting ? "..." : ""}
      </StyledMintButton>
    );
  }

  function MintButtonWL(props) {
    const [minting, setMinting] = useState(false);
    
    return (
      <StyledMintButtonWL
        disabled={!!props.disabled}
        minting={minting}
        onClick={async () => {
          if (minting || props.disabled) {
            return;
          }
          setMinting(true);
          try {
            const { signer, contract } = await connectWallet();
            
            const contractWithSigner = contract.connect(signer);
            let value
            
            
              
            value = ethers.utils.parseEther("0.0")
             
            
           
            const tx = await contractWithSigner.whitelistMint(1, {
              value,
            });
            const response = await tx.wait();
            showMessage({
              type: "success",
              title: "Mint Succeded",
              body: (
                <div>
                  <a
                    href={`https://${ETHERSCAN_DOMAIN}/tx/${response.transactionHash}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Transaction Details
                  </a>{" "}
                  
                  <a
                    href="https://opensea.io/account"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Or View On Opensea{" "}
                  </a>
                  
                </div>
              ),
            });
          } catch (err) {
            showMessage({
              type: "error",
              title: "Mint Failed",
              body: err.message,
            });
          }
          props.onMinted && props.onMinted();
          setMinting(false);
        }}
        style={{
          background: 'White',
          fontWeight: "bold" ,
          fontSize:'18px',
          marginTop:'10px',
          marginLeft:'7px',
          ...props.style,
  
        }}
      >
        WhiteList Mint {minting ? "..." : ""}
      </StyledMintButtonWL>
    );
  }

  
  if (status === "true" && iswhitelist === "true") {
    mintButton = (
      
      <div>
        <div style={{textAlign:'center'}}>
          <Button type="primary" shape="circle" onClick={handleDecrement} style={{height: "40px",width:'40px',fontSize:'20px'}}>
            -
          </Button>
          <Input  value={mintAmount} onChange={(e)=>{setmintAmount(parseInt(e.target.value))}} style={{fontSize:'20px',width:'50px',height: "40px",textAlign:'center',marginLeft:'10px',marginRight:'10px'}}/>
          <Button type="primary" shape="circle" onClick={handleIncrement} style={{height: "40px",width:'40px',fontSize:'20px'}}>
            +
          </Button>
          
        </div>
        <div>
          <MintButton
            onMinted={refreshStatus}
            mintAmount={1}
            style={{ marginRight: "20px" }}
          />
          <MintButtonWL
            onMinted={refreshStatus}
            mintAmount={1}
            style={{ marginRight: "20px" }}
          />
        </div>
      </div>
    );
  }


 
  if ( status === "true" && iswhitelist === "false") {
    mintButton = (
      
      <div>
        <div style={{textAlign:'center'}}>
          <Button type="primary" shape="circle" onClick={handleDecrement} style={{height: "40px",width:'40px',fontSize:'20px'}}>
            -
          </Button>
          <Input  value={mintAmount} onChange={(e)=>{setmintAmount(parseInt(e.target.value))}} style={{fontSize:'20px',width:'50px',height: "40px",textAlign:'center',marginLeft:'10px',marginRight:'10px'}}/>
          <Button type="primary" shape="circle" onClick={handleIncrement} style={{height: "40px",width:'40px',fontSize:'20px'}}>
            +
          </Button>
          
        </div>
        <MintButton
            onMinted={refreshStatus}
            mintAmount={1}
            style={{ marginRight: "20px" }}
          />
        <StyledMintButtonWL
          style={{
            background: "#eee",
            color: "#999",
            cursor: "not-allowed",
            width:'300px',
            fontSize: "20px"
          }}
        >
          You Are Not Whitelisted
        </StyledMintButtonWL>
      </div>
    );
  }






  if (status === "true" && iswhitelist === "true" && numberMinted === 1) {
    mintButton = (
      <div>
        <div style={{textAlign:'center'}}>
          <Button type="primary" shape="circle" onClick={handleDecrement} style={{height: "40px",width:'40px',fontSize:'20px'}}>
            -
          </Button>
          <Input  value={mintAmount} onChange={(e)=>{setmintAmount(parseInt(e.target.value))}} style={{fontSize:'20px',width:'50px',height: "40px",textAlign:'center',marginLeft:'10px',marginRight:'10px'}}/>
          <Button type="primary" shape="circle" onClick={handleIncrement} style={{height: "40px",width:'40px',fontSize:'20px'}}>
            +
          </Button>
          
        </div>
        <MintButton
            onMinted={refreshStatus}
            mintAmount={1}
            style={{ marginRight: "20px" }}
          />
        <StyledMintButtonWL
          style={{
            background: "#eee",
            color: "#999",
            cursor: "not-allowed",
            width:'300px',
            fontSize: "20px"
          }}
        >
          You Have Minted Already
        </StyledMintButtonWL>
      </div>
    );
  }



  if (progress >= 7290 ) {
    mintButton = (
      <div>
        <StyledMintButton
          style={{
            background: "#eee",
            color: "#999",
            cursor: "not-allowed",
            width:'200px',
            fontSize: "20px"
          }}
        >
          Minted Out
        </StyledMintButton>
        
      </div>
      
      
    );
  }

  if (status === "false"  ) {
    mintButton = (
      <div>
        <StyledMintButton
          style={{
            background: "#eee",
            color: "#999",
            cursor: "not-allowed",
            width:'200px',
            fontSize: "20px"
          }}
        >
          Not Started
        </StyledMintButton>
        
      </div>
      
      
    );
  }

  if (!fullAddress) {
    mintButton = (
      <StyledMintButton
        style={{
          background: "#eee",
          color: "#999",
          cursor: "not-allowed",
          width:'200px',
          fontSize: "20px"
        }}
      >
        Not Connected
      </StyledMintButton>
    );
  }

  

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        color:'white'
      }}
    >
      

      <div style={{ marginBottom: 5, display: "flex", alignItems: "center",marginTop: "7%", }}>
        Your Wallet Address： <ConnectWallet />{" "}
      </div>
      <div style={{ marginTop: 0, fontSize: 20, textAlign: "center",marginBottom: 10,}}>
        Total Minted：{progress === null ? "Not Connected" : progress} / 6790
      </div>

      {mintButton}


    </div>



  );
}


function Jackpot() {
  
  const [balance, setBalancee] = useState(0);
  const [balance2, setBalancee2] = useState(0);
  let newbalance
  let oldbalance
  let newbalance2
  let oldbalance2


  



  setInterval(()=>{
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.getBalance('0x6a7C8C04792B0f6455Dc77f0DcC9977F4C79dbbF').then((value)=>{
        
        oldbalance=Number(newbalance)
        newbalance=Number(formatUnits(value.toString(), 18)).toFixed(2)
      })

      provider.getBalance('0x2B0B2B9CCA4c7D834b0ed8f15a35Aa72E6D82AeB').then((value)=>{
        
        oldbalance2=newbalance2
        newbalance2=Number(formatUnits(value.toString(), 18)).toFixed(2)
      })

    }catch{}


    if (newbalance!==oldbalance){
      setBalancee(newbalance)
      
    }
    if (newbalance2!==oldbalance2){
      setBalancee2(newbalance2)

    }

  }
  ,1000)
  


  
  


  return (

      <Typography
        style={{ textAlign: "center", marginTop: "0%",color:'white',fontSize: '70px',fontWeight: "bold" }}
        variant="h3"
        gutterBottom
        component="div"
      >
        {parseFloat(balance)+parseFloat(balance2)} ETH
      </Typography>
      

  );
}

function Mint() {
  
  const [balance, setBalancee] = useState(0);
  const [balance2, setBalancee2] = useState(0);
  let newbalance
  let oldbalance
  let newbalance2
  let oldbalance2


  setInterval(()=>{
    try{
      const provider = new ethers.providers.Web3Provider(window.ethereum);
      provider.getBalance('0x6a7C8C04792B0f6455Dc77f0DcC9977F4C79dbbF').then((value)=>{
        
        oldbalance=newbalance
        newbalance=Number(formatUnits(value.toString(), 18)).toFixed(2)
      })

      provider.getBalance('0x2B0B2B9CCA4c7D834b0ed8f15a35Aa72E6D82AeB').then((value)=>{
        
        oldbalance2=newbalance2
        newbalance2=Number(formatUnits(value.toString(), 18)).toFixed(2)
      })

    }catch{}


    if (newbalance!==oldbalance){
      setBalancee(newbalance)
      
    }
    if (newbalance2!==oldbalance2){
      setBalancee2(newbalance2)

    }
  }
  ,1000)
  return (
    
    <Container
      style={{
        width: "100%",
        height: "100%",
        fontFamily:'CircularStd',
        wordSpacing:'-5px'
      }}
      
      id="mint"
    >
      
      
      
        <Row justify="center"  style={{color:'White',alignItems: 'center' }}>
          <Col span={0.5}>
            <img src='/icons/logo.png' style={{width:'60px',marginTop:'8px'}}></img>
          </Col>
          <Col span={4} offset={0}>
          <a
              href="https://www.worldcupchampion.xyz/"
              style={{color:"white"}}>
            <MenuWrapper style = {{ fontSize:'27px',}} >
            <MenuItem elementId="About">WorldcupChampion</MenuItem>
            
            </MenuWrapper> 
            </a>
          </Col>  
          <Col span={11} >
            
          </Col> 
          <Col span={3.5} >
            <MenuWrapper style = {{ fontSize:'22px',}} >
            
              <a
              href="https://www.worldcupchampion.xyz/"
              style={{color:"white"}}>
              <MenuItem elementId="About">
                Back to Homepage
              </MenuItem>
              </a>
            
            </MenuWrapper>
          </Col> 
          <Col span={1} >
          <a
              href="https://www.worldcupchampion.xyz/"
              style={{color:"white"}}>
          <img src='/icons/back2.svg' style={{width:'40px',marginTop:'2px'}}></img>
          </a>


          </Col> 
          
          <Col span={1} >
          <ConnectWallet showCollect={true} />
          </Col> 
          <Col span={1} >
          
          </Col> 



        </Row>
        
   
        <Row justify="center"  style={{color:'White',alignItems: 'center' }}>
        <Col span={1} >
        </Col>
        <Col span={3} >
            <Typography
              style={{ textAlign: "left", marginTop: "8%",color:'white',fontSize: '20px', }}
              variant="h3"
              gutterBottom
              component="div"
            >
              Top16: {(0.18*(parseFloat(balance)+parseFloat(balance2))).toFixed(2)} ETH<br />
              Top8: {(0.2*(parseFloat(balance)+parseFloat(balance2))).toFixed(2)} ETH<br />
              Third place: {(0.15*(parseFloat(balance)+parseFloat(balance2))).toFixed(2)} ETH <br />
              Runners-up: {(0.05*(parseFloat(balance)+parseFloat(balance2))).toFixed(2)} ETH<br />
              Champion: {(0.3*(parseFloat(balance)+parseFloat(balance2))).toFixed(2)} ETH <br />
              Golden Ball: {(0.04*(parseFloat(balance)+parseFloat(balance2))).toFixed(2)} ETH <br />
              Golden Boot: {(0.04*(parseFloat(balance)+parseFloat(balance2))).toFixed(2)} ETH <br />
              Golden Glove: {(0.04*(parseFloat(balance)+parseFloat(balance2))).toFixed(2)} ETH <br />
            </Typography>
          </Col> 
          
          
          <Col span={16} >
            <Typography
              style={{ textAlign: "center", marginTop: "8%",color:'white',fontSize: '60px',fontWeight: "bold" }}
              variant="h3"
              gutterBottom
              component="div"
              
            >
              WorldcupChampion
            </Typography>
          </Col> 
          <Col span={4} >
        </Col>
        </Row>
      <Content>
        <Typography
          style={{
            marginTop: '1%',
            marginLeft: '3%',
            fontSize: '19px',
            
            textAlign: "center",
            color:'white',
            width:'780px'
          }}
          variant="body1"
          gutterBottom
        >
          Worldcup Champion is a collection of 7290 jersey NFTs unlocking access to 
            
        </Typography>
        <Typography
          style={{
            marginTop: '1%',
            marginLeft: '3%',
            fontSize: '19px',
            
            textAlign: "center",
            color:'white',
            width:'780px'
          }}
          variant="body1"
          gutterBottom
        >
          Worldcup2022 betting game. Holders can carve up bonus pool as the game goes on.
            
        </Typography>
      
        <Typography
        style={{ textAlign: "center", marginTop: "8%",color:'white',fontSize: '40px', }}
        variant="h3"
        gutterBottom
        component="div"
      >
        Prize Pool: 
      </Typography>


        <div>
          <Jackpot />
        </div>


        <div>
          <MintSection />
        </div>
        
      </Content>
    

    </Container>
  );
}

export default Mint;
