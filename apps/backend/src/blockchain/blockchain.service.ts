import {
    Injectable,
    InternalServerErrorException,
    ServiceUnavailableException,
} from "@nestjs/common";
import { createPublicClient, http } from "viem";
import { avalancheFuji } from "viem/chains";
import { SIMPLE_STORAGE_ABI } from "./simple-storage.abi";

@Injectable()
export class BlockchainService {
    private client;
    private contractAddress: `0x${string}`;

    constructor() {
        this.client = createPublicClient({
            chain: avalancheFuji,
            transport: http("https://api.avax-test.network/ext/bc/C/rpc", {
                timeout: 10_000,
            }),
        });

        this.contractAddress = "0x053E2B9c2dca9d34915D932B469C3f33E405Ba5E"; // punyamu
    }

    async getLatestValue() {
        try {
            const value = await this.client.readContract({
                address: this.contractAddress,
                abi: SIMPLE_STORAGE_ABI,
                functionName: "getValue",
            });

            return {
                value: value.toString(),
            };
        } catch (error) {
            this.handleRpcError(error);
        }
    }

    async getValueUpdatedEvents() {
        try {
            const latestBlock = await this.client.getBlockNumber();

            const fromBlock = latestBlock - 500n; // ambil 500 block terakhir saja

            const events = await this.client.getLogs({
                address: this.contractAddress,
                event: {
                    type: "event",
                    name: "ValueUpdated",
                    inputs: [{ name: "newValue", type: "uint256", indexed: false }],
                },
                fromBlock,
                toBlock: "latest",
            });

            return events.map((event) => ({
                blockNumber: event.blockNumber?.toString(),
                value: event.args.newValue.toString(),
                txHash: event.transactionHash,
            }));
        } catch (error: any) {
            this.handleRpcError(error);
        }
    }


    private handleRpcError(error: any): never {
        const msg = error?.message?.toLowerCase() || "";

        if (msg.includes("timeout")) {
            throw new ServiceUnavailableException(
                "RPC timeout. Silakan coba lagi."
            );
        }

        if (msg.includes("network") || msg.includes("fetch")) {
            throw new ServiceUnavailableException(
                "Tidak dapat terhubung ke blockchain RPC."
            );
        }

        throw new InternalServerErrorException(
            "Gagal membaca data blockchain."
        );
    }
}
