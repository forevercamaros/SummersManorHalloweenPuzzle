using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Linq;
using MySql.Data.MySqlClient;
using SummersManorHalloweenPuzzle.Models;

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
                using (MySqlConnection con = new MySqlConnection(Environment.GetEnvironmentVariable("CONNECTIONSTRING")))
                {      
                    _logger.LogInformation($"Checking if group {groupName} exists");
                    var parameters = new { GroupName = groupName }; 
                    var groups = con.Query<Group>("SELECT GroupName FROM SummersManor.Group WHERE GroupName = @GroupName;",parameters);                
                    if (groups.Count() == 0)
                    {
                        using (MySqlCommand cmd = new MySqlCommand("INSERT INTO SummersManor.Group (GroupName) VALUES (@GroupName)",con))
                        {
                            con.Open();
                            cmd.Parameters.AddWithValue("GroupName", groupName);
                            cmd.ExecuteNonQuery();                
                        }
                    }
                    return new GroupExistsModel() { GroupExists = groups.Count() > 0, };
                }
            
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
            using (var connection = new MySqlConnection(Environment.GetEnvironmentVariable("CONNECTIONSTRING")))
            {                
                return connection.Query<GroupResults>("SELECT ROW_NUMBER() OVER(ORDER BY RemainingTime DESC) AS Position, GroupName, RemainingTime FROM SummersManor.Group").ToArray();
            }
        }

        [HttpPost]
        [Route("UpdateRemainingTime")]
        public void UpdateRemainingTime([FromBody] UpdateGroupRemainingTime groupRemainingTime)
        {
            using (MySqlConnection con = new MySqlConnection(Environment.GetEnvironmentVariable("CONNECTIONSTRING")))
            using (MySqlCommand cmd = new MySqlCommand("UPDATE SummersManor.Group SET RemainingTime = @RemainingTime WHERE (GroupName = @GroupName)",con))
            {
                con.Open();
                cmd.Parameters.AddWithValue("GroupName", groupRemainingTime.groupName);
                cmd.Parameters.AddWithValue("RemainingTime", groupRemainingTime.remainingTime);
                cmd.ExecuteNonQuery();                
            }
        }
    }

    public class GroupResults
    {
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
