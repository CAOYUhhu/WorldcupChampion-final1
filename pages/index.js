import Head from 'next/head';

import Mint from '../components/Mint';
import Typography from "@mui/material/Typography";


export default function Home() {
  return (
    <div className='div1'>
      <Head>
        <title> World Cup 2022 NFT</title>   
        <link rel="icon" href="/favicon.png" />
      </Head>
      
      <Typography className='ty1'>
        
        <img src='/icons/spin.avif' className='rotate-center'></img>
        <img src='/icons/back.avif' className='back-insert'></img>
        <Mint />

      </Typography>

    </div>
            

  );
}
