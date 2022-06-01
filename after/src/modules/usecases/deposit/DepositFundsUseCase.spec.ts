import { UniqueEntityID } from '../../../shared/domain/UniqueEntityID';
import { DepositFundsUseCase } from "./DepositFundsUseCase"
import { Account } from './domain/account';
import {DateTimeProvider} from "../../../shared/domain/dateTimeProvider"
import { InMemoryAccountRepository } from './repos/AccountRepository';
import { InMemoryTransactionRepository } from './repos/TransactionRepository';


class CustomDateTimeProvider implements DateTimeProvider {
    private nextDate = 0; 
    
    now(): number {
        return this.nextDate; 
    }  

    next(date: number) {
        this.nextDate = date; 
    } 
}

describe('Deposit funds', () => {
    it('should fail when the account does not exist', async () => {
        const accountRepository = new InMemoryAccountRepository(); 
        const transactionRepository = new InMemoryTransactionRepository(new CustomDateTimeProvider())

        const useCase = new DepositFundsUseCase(accountRepository, transactionRepository);

        const results = await useCase.execute({accountId: 'SOME_ACCOUNT_ID', amount: 0})

        expect(results).toEqual({
            type: 'AccountDoesNotExistError',
            message: 'Account does not exist'
        })
    }); 

    it('should not deposit an invalid amount', async () => {
        const accountRepository = new InMemoryAccountRepository(); 
        const transactionRepository = new InMemoryTransactionRepository(new CustomDateTimeProvider())
        
        const useCase = new DepositFundsUseCase(accountRepository, transactionRepository);

        const results = await useCase.execute({accountId: 'SOME_ACCOUNT_ID', amount: null})

        expect(results).toEqual({
            type: 'InvalidAmountError',
            message: 'Can not deposit an invalid amount'
        })
    }); 

    it('should not deposit a negative number', async () => {
        const accountRepository = new InMemoryAccountRepository(); 
        const transactionRepository = new InMemoryTransactionRepository(new CustomDateTimeProvider())

        const useCase = new DepositFundsUseCase(accountRepository, transactionRepository);

        const results = await useCase.execute({accountId: 'SOME_ACCOUNT_ID', amount: -10})

        expect(results).toEqual({
            type: 'InvalidAmountError',
            message: 'Can not deposit an invalid amount'
        })
    }); 

    it('should update the account balance after the deposit', async () => {
        const accountRepository = new InMemoryAccountRepository(); 
        const transactionRepository = new InMemoryTransactionRepository(new CustomDateTimeProvider())

        const newAccount = Account.create(new UniqueEntityID('ACC_1'), 'some_user_name', 10); 
        
        accountRepository.add([newAccount]); 
        
        const useCase = new DepositFundsUseCase(accountRepository, transactionRepository);


        await useCase.execute({accountId: 'ACC_1', amount: 100}); 


        const account = await accountRepository.fetch('ACC_1'); 

        expect(account?.getBalance().getValue()).toEqual(110)
    }); 

    it('should generate a deposit transaction after the deposit', async () => {
        const accountRepository = new InMemoryAccountRepository(); 
        const dateTime = new CustomDateTimeProvider(); 

        const RANDOM_DATE_NUMBER = 452202121245; 
        dateTime.next(RANDOM_DATE_NUMBER); 

        const transactionRepository = new InMemoryTransactionRepository(dateTime)

        const newAccount = Account.create(new UniqueEntityID('ACC_1'), 'some_user_name', 10); 
        
        accountRepository.add([newAccount]); 
        
        const useCase = new DepositFundsUseCase(accountRepository, transactionRepository);


        await useCase.execute({accountId: 'ACC_1', amount: 100}); 


        const results = await transactionRepository.fetch('ACC_1'); 

        expect(results).toEqual([{
            accountId: 'ACC_1', 
            transactionAmount: 100, 
            type: 'deposit', 
            date: RANDOM_DATE_NUMBER
        }])
    }); 

    it('should generate two deposit transactions after two deposits', async () => {
        const accountRepository = new InMemoryAccountRepository(); 
        const dateTime = new CustomDateTimeProvider(); 

        const RANDOM_DATE_NUMBER = 452202121245; 
        dateTime.next(RANDOM_DATE_NUMBER); 

        const transactionRepository = new InMemoryTransactionRepository(dateTime)

        const newAccount = Account.create(new UniqueEntityID('ACC_1'), 'some_user_name', 10); 
        
        accountRepository.add([newAccount]); 
        
        const useCase = new DepositFundsUseCase(accountRepository, transactionRepository);


        await useCase.execute({accountId: 'ACC_1', amount: 100}); 
        await useCase.execute({accountId: 'ACC_1', amount: 200}); 


        const results = await transactionRepository.fetch('ACC_1'); 

        const account = await accountRepository.fetch('ACC_1'); 

        expect(results).toEqual([{
            accountId: 'ACC_1', 
            transactionAmount: 100, 
            type: 'deposit', 
            date: RANDOM_DATE_NUMBER
        }, {
            accountId: 'ACC_1', 
            transactionAmount: 200, 
            type: 'deposit', 
            date: RANDOM_DATE_NUMBER
        }])

        expect(account?.getBalance().getValue()).toEqual(310)
    })
})