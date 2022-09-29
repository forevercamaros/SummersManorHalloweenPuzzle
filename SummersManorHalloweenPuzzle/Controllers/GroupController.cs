using Dapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlClient;
using System.Linq;
using System.Threading.Tasks;

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
            using (SqlConnection con = new SqlConnection(Configuration["ConnectionString"]))
            using(SqlCommand cmd = new SqlCommand("SELECT GroupName FROM GroupCompletedTimes WHERE (GroupName = @GroupName)",con))
            using(SqlDataAdapter da = new SqlDataAdapter(cmd))
            {
                // cmd.Parameters.Add(new SqlParameter("GroupName",groupName));
                // var tbl = new DataTable();
                // da.Fill(tbl);
                // if (tbl.Rows.Count == 0)
                // {
                //     using (SqlCommand cmd2 = new SqlCommand("InsertGroup",con))
                //     {
                //         con.Open();
                //         cmd2.CommandType=CommandType.StoredProcedure;
                //         cmd2.Parameters.Add(new SqlParameter("GroupName",groupName));
                //         cmd2.ExecuteNonQuery();
                //     }
                // }
                //return new GroupExistsModel() { GroupExists = tbl.Rows.Count > 0, };
                return new GroupExistsModel() { GroupExists = false, };
            }
        }

        [HttpGet]
        [Route("GroupResults")]
        public GroupResults[] GroupResults()
        {
            using (var connection = new SqlConnection(Configuration["ConnectionString"]))
            {
                GroupResults[] testGroupResults = new GroupResults[]
                {
                    new GroupResults(){Position = 0,RemainingTime = 0,GroupName = "Test"}                                         
                };
                return testGroupResults;
                //return connection.Query<GroupResults>("SELECT ROW_NUMBER() OVER(ORDER BY RemainingTime DESC) AS Position, GroupName, RemainingTime FROM GroupCompletedTimes").ToArray();
            }
        }

        [HttpPost]
        [Route("UpdateRemainingTime")]
        public void UpdateRemainingTime([FromBody] UpdateGroupRemainingTime groupRemainingTime)
        {
            // using (SqlConnection con = new SqlConnection(Configuration["ConnectionString"]))
            // using (SqlCommand cmd = new SqlCommand("UPDATE GroupCompletedTimes SET RemainingTime = @RemainingTime WHERE (GroupName = @GroupName)", con))
            // {
            //     con.Open();
            //     cmd.Parameters.Add(new SqlParameter("GroupName", groupRemainingTime.groupName));
            //     cmd.Parameters.Add(new SqlParameter("RemainingTime", groupRemainingTime.remainingTime));
            //     cmd.ExecuteNonQuery();
            // }
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
