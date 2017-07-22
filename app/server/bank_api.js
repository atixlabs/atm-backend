'use strict';

import faker from "faker";

const BankAPI = {

    getUserData : function(bankCredentials)
    {
        //TODO communicate with external bank API to get User Data
        return {
            email: faker.internet.email(),
            name: faker.name.firstName(),
            surname: faker.name.lastName(),
            registrationDate: faker.date.past(),
            phone: faker.phone.phoneNumber(),
            birthdate: faker.date.past(),
            postaddress: {
                address: faker.address.streetAddress(),
                city: faker.address.city(),
                state: faker.address.state(),
                zip: faker.address.zipCode()
            },

            maxAllowedWithdrawal: 10000
        };
    },
}

export default BankAPI;
