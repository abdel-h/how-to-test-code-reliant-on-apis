import { UseCase } from "../../../shared/core/useCase";
import { AccountRepository } from './repos/AccountRepository';
import { TransactionRepository } from "./repos/TransactionRepository";

type Input = {
    accountId: string;
    amount: number | null;
};
type AccountDoesNotExist = {
    type: 'AccountDoesNotExistError',
    message: 'Account does not exist';
};
type InvalidAmountError = {
    type: 'InvalidAmountError',
    message: 'Can not deposit an invalid amount';
};
type InsufficientFundsError = {
    type: 'InsufficientFundsError',
    message: 'You have no Insufficient Funds',
};

type Results = AccountDoesNotExist | InvalidAmountError | InsufficientFundsError | null;

export class WithdrawFundsUseCase implements UseCase<Input, Results> {
    constructor(private accountRepository: AccountRepository, private transactionRepository: TransactionRepository) { };

    async execute(input: Input): Promise<Results | null> {

        if (input.amount === null) {
            return {
                type: 'InvalidAmountError',
                message: 'Can not deposit an invalid amount',
            };
        }

        const account = await this.accountRepository.fetch(input.accountId);

        if (account === null) {
            return {
                type: 'AccountDoesNotExistError',
                message: 'Account does not exist'
            };
        }
        const withdrawResult = account.withdrawBalance(account.getBalance(), input.amount);

        if (withdrawResult.isFailure) {
            return {
                type: 'InsufficientFundsError',
                message: 'You have no Insufficient Funds',
            };
        }
        this.accountRepository.update(account.getAccountId(), account);
        
        this.transactionRepository.add({
            accountId: account.getAccountId(),
            transactionAmount: input.amount,
            type: 'withdraw',
        })
        return null;
    }
}