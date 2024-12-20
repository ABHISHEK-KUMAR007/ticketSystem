import {useState,} from "react";
import ABI from "../ABI/ticket.json"
import {ethers,Contract} from "ethers"
export const ConnectWallet=async()=>{
    try{
        let [Account,provider,contractSigner,signer ,contractProvider,chainId]=[null,null,null,null,null,null];
        
        if(window.ethereum===null){
            throw new Error("install metamask");
        }

        const accounts=await window.ethereum.request({method:"eth_requestAccounts"});
        Account=accounts[0];

        const chainIdHex=await window.ethereum.request({method:"eth_chainId"});
        chainId=chainIdHex.toString();
        const ContractAddress="0xa6118dd525f489d3fae37d571e899abd2fab5c5f";
        provider= new  ethers.BrowserProvider(window.ethereum);
        signer = await provider.getSigner();

        contractProvider=new Contract(ContractAddress,ABI,provider);
        contractSigner=new Contract(ContractAddress,ABI,signer);
        
        return [Account,provider,contractSigner,contractProvider,chainId]
    }
    catch(error){
        throw new Error("can't connect the wallet")
    }
    

}
//export default ConnectWallet;