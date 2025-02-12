# ONS

[![Build Status](https://travis-ci.org/optimismname/ons.svg?branch=master)](https://travis-ci.org/optimismname/ons)

Implementations for registrars and local resolvers for the Optimism Name Service.

For documentation of the ONS system, see [docs.optimism.name](https://docs.optimism.name/).

To run unit tests, clone this repository, and run:

    $ npm install
    $ npm test

# npm package

This repo doubles as an npm package with the compiled JSON contracts

```js
import {
  Deed,
  DeedImplementation,
  ONS,
  ONSRegistry,
  FIFSRegistrar,
  Migrations,
  Registrar,
  ReverseRegistrar,
  TestRegistrar
} from '@optimismname/ons'
```

## ONSRegistry.sol

Implementation of the ONS Registry, the central contract used to look up resolvers and owners for domains.

## FIFSRegistrar.sol

Implementation of a simple first-in-first-served registrar, which issues (sub-)domains to the first account to request them.

# ONS Registry interface

The ONS registry is a single central contract that provides a mapping from domain names to owners and resolvers, as described in [EIP 137](https://github.com/ethereum/EIPs/issues/137).

The ONS operates on 'nodes' instead of human-readable names; a human readable name is converted to a node using the namehash algorithm, which is as follows:

    def namehash(name):
      if name == '':
        return '\0' * 32
      else:
        label, _, remainder = name.partition('.')
        return sha3(namehash(remainder) + sha3(label))

The registry's interface is as follows:

## owner(bytes32 node) constant returns (address)

Returns the owner of the specified node.

## resolver(bytes32 node) constant returns (address)

Returns the resolver for the specified node.

## setOwner(bytes32 node, address owner)

Updates the owner of a node. Only the current owner may call this function.

## setSubnodeOwner(bytes32 node, bytes32 label, address owner)

Updates the owner of a subnode. For instance, the owner of "foo.com" may change the owner of "bar.foo.com" by calling `setSubnodeOwner(namehash("foo.com"), sha3("bar"), newowner)`. Only callable by the owner of `node`.

## setResolver(bytes32 node, address resolver)

Sets the resolver address for the specified node.

# Resolvers

Resolvers can be found in the resolver specific [repository](https://github.com/optimismname/resolvers).

# Generating LLL ABI and binary data

ONS.lll.bin was generated with the following command, using the lllc packaged with Solidity 0.4.4:

    $ lllc ONS.lll > ONS.lll.bin

The files in the abi directory were generated with the following command:

    $ solc --abi -o abi AbstractONS.sol FIFSRegistrar.sol HashRegistrarSimplified.sol

# Getting started

Install Truffle

    $ npm install -g truffle

Launch the RPC client, for example TestRPC:

    $ testrpc

Deploy `ONS` and `FIFSRegistrar` to the private network, the deployment process is defined at [here](migrations/2_deploy_contracts.js):

    $ truffle migrate --network dev.fifs

Check the truffle [documentation](http://truffleframework.com/docs/) for more information.
