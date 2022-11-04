using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using MySql.Data.MySqlClient;
using SummersManorHalloweenPuzzle.Models;
using MongoDB.Driver;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace SummersManorHalloweenPuzzle.Controllers
{   

    [ApiController]
    public class GroupController : Controller
    {        
        private readonly IConfiguration Configuration;
        private readonly ILogger<GroupController> _logger;

        public GroupController(ILogger<GroupController> logger, IConfiguration configuration)
        {
            Configuration = configuration;
            _logger=logger;
        }

        [HttpGet]
        [Route("GroupExists")]
        public GroupExistsModel GroupExists(string groupName)
        {            
            try
            {                                
                _logger.LogInformation($"Seeing if group {groupName} exists");
                var settings = MongoClientSettings.FromConnectionString("mongodb://webapp:Rpibbb013@mongo:27017/SummersManor?authSource=admin");
                settings.ServerApi = new ServerApi(ServerApiVersion.V1);
                var client = new MongoClient(settings);
                var database = client.GetDatabase("SummersManor");
                var collection = database.GetCollection<BsonDocument>("Groups");
                var groupExists = collection.Find(Builders<BsonDocument>.Filter.Eq("GroupName", groupName)).CountDocuments() != 0;
                if (!groupExists)
                {
                    collection.InsertOne(new BsonDocument
                    {
                        { "GroupName", groupName }
                    });
                }
                return new GroupExistsModel() { GroupExists = groupExists, };                
            
            }catch(Exception e){
                _logger.LogError(e,"Error In GroupExists Method");
                return new GroupExistsModel(){GroupExists = true};
            }
        }

        [HttpGet]
        [Route("GroupResults")]
        public GroupResults[] GroupResults()
        {
            _logger.LogInformation($"Getting Group Results");
            var settings = MongoClientSettings.FromConnectionString("mongodb://webapp:Rpibbb013@mongo:27017/SummersManor?authSource=admin");
            settings.ServerApi = new ServerApi(ServerApiVersion.V1);
            var client = new MongoClient(settings);
            var database = client.GetDatabase("SummersManor");
            var collection = database.GetCollection<GroupResults>("Groups");
            var sort = Builders<GroupResults>.Sort.Descending("RemainingTime");
            var groups = collection.Find(new BsonDocument()).Sort(sort).ToList();
            for(var i = 0; i<groups.Count(); i++)
            {
                groups[i].Position=i+1;
            }
            return groups.ToArray();
        }

        [HttpPost]
        [Route("UpdateRemainingTime")]
        public void UpdateRemainingTime([FromBody] UpdateGroupRemainingTime groupRemainingTime)
        {
            var settings = MongoClientSettings.FromConnectionString("mongodb://webapp:Rpibbb013@mongo:27017/SummersManor?authSource=admin");
            settings.ServerApi = new ServerApi(ServerApiVersion.V1);
            var client = new MongoClient(settings);
            var database = client.GetDatabase("SummersManor");
            var collection = database.GetCollection<BsonDocument>("Groups");
            var filter = Builders<BsonDocument>.Filter.Eq("GroupName", groupRemainingTime.groupName);
            var update = Builders<BsonDocument>.Update.Set("RemainingTime", groupRemainingTime.remainingTime);
            collection.UpdateOne(filter,update);
        }
    }

    public class GroupResults
    {
        public ObjectId _id { get; set; }
        public int Position { get; set; }
        public string GroupName {  get; set; }

        public int RemainingTime {  get; set; }

        public string FormattedRemainingTime 
        { 
            get 
            {
                TimeSpan time = TimeSpan.FromSeconds(RemainingTime);

                //here backslash is must to tell that colon is
                //not the part of format, it just a character that we want in output
                return time.ToString(@"mm\:ss");
                
            } 
        }
    }

    public class UpdateGroupRemainingTime
    {
        public string groupName { get; set; }
        public int remainingTime {  get; set; }
    }

    public class GroupExistsModel
    {
        public bool GroupExists { get; set; }
    }
}
