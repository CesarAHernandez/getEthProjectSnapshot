import 'dotenv/config'
import * as fs from 'fs'
import { ethers } from 'ethers'

const initProvider = () =>{
    const nodeUrl = process.env.ETH_NODE_URL
    let contractAbi: ethers.ContractInterface = ''
    try {
     contractAbi = JSON.parse(process.env.CONTRACT_ABI)
    } catch (err) {
        /* handle error */
        console.error(err.message)
    }
    const contractAddress = process.env.CONTRACT_ADDRESS
    const provider = new ethers.providers.StaticJsonRpcProvider(nodeUrl,1)
    // Note we don't need a signer
    return new ethers.Contract(contractAddress,contractAbi,provider)
}
const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve,ms))
const getOwnerBatch = async (start: number, end: number, getFn: (id: number) =>Promise<string>) =>{

    const owners: Record<number,string> = {}
    for (let i = start, len = end; i < len; i++) {
        try {
        const ownerAddress = await getFn(i)
        owners[i] = ownerAddress
        } catch (err) {
            /* handle error */
            try {
                // retry
                await sleep(500)
                const ownerAddress = await getFn(i)
                owners[i] = ownerAddress
            } catch (err) {
                /* handle error */
                console.log(err.message, `id: ${i}`)
            }
        }
    }
    return owners
}

const main = async ()=>{
    console.log('Initializing contract');
    const contract = initProvider()
    const totalSupplyBN = await contract.totalSupply() as ethers.BigNumber
    let totalSupply = totalSupplyBN.toNumber()
    const batchSize = Math.ceil(totalSupply / 30)
    const amountOfBatches = Math.ceil(totalSupply / batchSize)
    console.log('Amount of batches of',batchSize,'is', amountOfBatches);

    const promises = []
    for (let i = 0, len = amountOfBatches; i < len; i++) {
        const start = i * batchSize
        let end = start + batchSize
        if(i === len -1){
            end = start + totalSupply
            promises.push( getOwnerBatch(start,end + 1, contract.ownerOf ))
            continue
        } 
        totalSupply -= batchSize
        promises.push( getOwnerBatch(start,end + 1, contract.ownerOf ))
    }
    console.log('Getting the owners of the contract');
    const results = await Promise.all(promises)

    const owners: Record<string, number> = {}
    results.forEach((chunk)=>{
        const addresses = Object.values(chunk) as string[]
        addresses.forEach(address => {
            owners[address] = owners[address] ? owners[address] + 1 : 1
        })
    })

    const saveDir = process.env.SAVE_DIR ? process.env.SAVE_DIR: './whiteList.json'
    fs.writeFileSync(saveDir,JSON.stringify({addresses: Object.keys(owners)}),'utf-8')
}




(async ()=>{
    await main()
})()
