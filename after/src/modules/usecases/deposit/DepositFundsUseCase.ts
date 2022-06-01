import { UseCase } from '../../../shared/core/useCase';
import { DepositAmount } from './domain/depositAmount';
import { AccountRepository } from './repos/AccountRepository';

import {left} from "../../../shared/core/result"
import { TransactionRepository } from './repos/TransactionRepository';


type AccountDoesNotExist = {
    type: 'AccountDoesNotExistError',
    message: 'Account does not exist'
}

type InvalidAmount = {
    type: 'InvalidAmountError',
    message: 'Can not deposit an invalid amount'
}

type Results = AccountDoesNotExist | InvalidAmount | null;

type Input = {
    accountId: string;
    amount: number | null
};

export class DepositFundsUseCase implements UseCase<Input, Results> {
    constructor(private accountRepository: AccountRepository, private transactionRepository: TransactionRepository) { }

    async execute(input: Input): Promise<Results | null> {

        const depositAmountOrError = DepositAmount.create(input.amount ?? null); 

        if (depositAmountOrError.isFailure) {
            return {
                type: 'InvalidAmountError',
                message: 'Can not deposit an invalid amount'
            }
        }

        const depositAmount = depositAmountOrError.getValue() as DepositAmount; 

        
        const account = await this.accountRepository.fetch(input.accountId);

        
        if (account === null) {
            return {
                type: 'AccountDoesNotExistError',
                message: 'Account does not exist'
            }
        }
        
        account?.depositBalance(depositAmount.getValue())

        await this.accountRepository.update(input.accountId, account);

        await this.transactionRepository.add({
            accountId: account.getAccountId(), 
            transactionAmount: depositAmount.getValue(), 
            type: 'deposit'
        })

        return null;
    }
}