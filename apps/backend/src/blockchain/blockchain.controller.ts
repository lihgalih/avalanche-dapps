import { Controller, Get } from "@nestjs/common";
import { BlockchainService } from "./blockchain.service";

@Controller("blockchain")
export class BlockchainController {
    constructor(private readonly blockchainService: BlockchainService) { }

    @Get("value")
    getValue() {
        return this.blockchainService.getLatestValue();
    }

    @Get("events")
    getEvents() {
        return this.blockchainService.getValueUpdatedEvents();
    }
}
