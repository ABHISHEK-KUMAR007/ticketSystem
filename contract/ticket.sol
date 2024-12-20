//SPDX-License-Identifier:MIT

pragma solidity >0.7.0;
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
//import "@openzeppelin/contracts/token/ERC721/extensions/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
contract eventNFT is ERC721URIStorage{
    event saleTicket(address indexed own,uint indexed token);
    event givepermissionsaleTicket(uint indexed price,address indexed own,bool indexed approved);
    event resaleTicketBought(uint indexed price,address indexed own,bool indexed approved);
    using Counters for Counters.Counter;
    Counters.Counter private _tokenid;
    constructor()  ERC721("TicketNFT", "TNFT") {}
    struct eventDetail{
        uint Id;
        string name;
        string description;
        uint256 price;
        uint TotalallotedTicket;
        uint remaining_ticket;
        uint startingTime;
        uint endTime;
        address[] customer;

    }
    struct resaleTicket{
        uint price;
        address seller;
        bool approved;
    }
    mapping(uint => resaleTicket) public ResalseTickets;
    mapping(uint=>address) public organiser;
    mapping(uint=>uint)public TokenEvent;
    eventDetail[] public eventsList;
    uint[] public resaleTicketIds;
    function AddEvent(
        string memory name,
        string memory description,
        uint256 price,
        uint TotalallotedTicket,
        uint startingTime,
        uint endTime
    ) public payable{
            uint Id=eventsList.length+1;
            organiser[Id]=msg.sender;

            eventsList.push(
                eventDetail(Id,
                name,
                description,
                price,
                TotalallotedTicket,
                TotalallotedTicket,
                startingTime,
                endTime,
                new address[](0)));

                
    }
    function calculateDynamicPrice(uint starting_price,uint TotalTicket,uint remainingTicket,uint multiplierFactor)public pure returns(uint){

        uint DynamicPrice=starting_price+(((TotalTicket-remainingTicket)/TotalTicket)*multiplierFactor);
        return DynamicPrice;
    }
    function buyTicket(uint eventid) public payable {
        require(eventid <= eventsList.length && eventid!=0 , "Invalid event ID");
        require(eventsList[eventid-1].remaining_ticket > 0, "Sold out");

        eventDetail storage e = eventsList[eventid-1];
        uint DynamicPrice = calculateDynamicPrice(e.price, e.TotalallotedTicket, e.remaining_ticket, 10);
        require(msg.value >= DynamicPrice, "Insufficient funds");

        
        _tokenid.increment();
        uint newtokenid = _tokenid.current();
        _mint(msg.sender, newtokenid);

        e.remaining_ticket--;
        e.customer.push(msg.sender);

        TokenEvent[newtokenid] = eventid;
        e.price = DynamicPrice;
        payable(organiser[e.Id]).transfer(DynamicPrice);
    }


    function cancelEvent(uint eventid)public{
        eventDetail storage e=eventsList[eventid-1];
        require(msg.sender==organiser[eventid],"you don't have permission to cancel the event");
        for(uint i=0;i<e.customer.length;i++){
            payable(e.customer[i]).transfer(e.price);
        }
    }
    function completedEvent()public view returns(eventDetail[] memory){
            eventDetail[] memory x=new eventDetail[](0);
            for(uint i=0;i<eventsList.length;i++){
                if(eventsList[i].endTime<block.timestamp){
                    x[i]=eventsList[i];
                }
            }
            return x;
    }
    
    function UpcomingEvent()public view returns(eventDetail[] memory){
            eventDetail[] memory x=new eventDetail[](0);
            for(uint i=0;i<eventsList.length;i++){
                if(eventsList[i].startingTime>block.timestamp){
                    x[i]=eventsList[i];
                }
            }
            return x;
    }
    function GivePermissionToResale(uint tokenid)public {
        require(msg.sender==organiser[TokenEvent[tokenid]],"you don't hold authority to give permission");
        ResalseTickets[tokenid].approved=true;
        
        emit givepermissionsaleTicket(ResalseTickets[tokenid].price,ResalseTickets[tokenid].seller,ResalseTickets[tokenid].approved);
    }
    function approveForResale(uint tokenid) public {
        require(ownerOf(tokenid) == msg.sender, "Only the owner can approve resale");
        approve(address(this), tokenid);  // Approve the contract to transfer this token
    }

    function saleresaleTicket(uint tokenid,uint price) public payable{
        //require(_exists(tokenid), "Token does not exist");

        require(ownerOf(tokenid)==msg.sender,"you don't have the right to sell this ticket");
        require(price>0,"price can't be zero or less than zero");
        ResalseTickets[tokenid]=resaleTicket(price,msg.sender,false);
        resaleTicketIds.push(tokenid);
        emit saleTicket(msg.sender,tokenid);
    }
    
    function getResaleTickets() public view returns (resaleTicket[] memory) {
        uint count = resaleTicketIds.length;
        resaleTicket[] memory tickets = new resaleTicket[](count);

        for (uint i = 0; i < count; i++) {
            tickets[i] = ResalseTickets[resaleTicketIds[i]];
        }

        return tickets;
    }

    function BuyResaleTiket(uint tokenid) public payable {
        require(ResalseTickets[tokenid].approved == true, "It does not have approval to sale");
        require(msg.value >= ResalseTickets[tokenid].price, "You don't have enough money");
        
        require(getApproved(tokenid) == address(this), "Contract is not approved to transfer this token");
        
        uint ResaleFeeForOrganiser = ResalseTickets[tokenid].price / 10;
        
        _transfer(ResalseTickets[tokenid].seller, msg.sender, tokenid);
        
        
        payable(organiser[TokenEvent[tokenid]]).transfer(ResaleFeeForOrganiser);
        
        
        payable(ResalseTickets[tokenid].seller).transfer(ResalseTickets[tokenid].price - ResaleFeeForOrganiser);
        
        emit resaleTicketBought(ResalseTickets[tokenid].price, ResalseTickets[tokenid].seller, ResalseTickets[tokenid].approved);
    }
    function AllEvents()public view returns( eventDetail[] memory) {
        return eventsList;
    }
    function getOwnedTickets(address owner) public view returns (uint[] memory) {
        uint[] memory ownedTickets = new uint[](_tokenid.current());
        uint count = 0;

        for (uint i = 1; i <= _tokenid.current(); i++) {
            if (ownerOf(i) == owner) {
                ownedTickets[count] = i;
                count++;
            }
        }

        uint[] memory result = new uint[](count);
        for (uint j = 0; j < count; j++) {
            result[j] = ownedTickets[j];
        }
        return result;
    }

}