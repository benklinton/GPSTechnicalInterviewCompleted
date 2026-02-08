using GPS.ApplicationManager.Web.Controllers.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Text.Json;
using System.Threading.Tasks;

namespace GPS.ApplicationManager.Web.Controllers
{
  [ApiController]
  [Route("[controller]")]
  public class ApplicationManagerController : ControllerBase
  {
    private readonly ILogger<ApplicationManagerController> _logger;
    private static readonly string _filePath = "loanApplication.json";

    public ApplicationManagerController(ILogger<ApplicationManagerController> logger)
    {
      _logger = logger;
    }

    private async static Task<List<LoanApplication>> GetApplicationsFromFileAsync()
    {
      if (System.IO.File.Exists(_filePath))
      {
        var existingJson = await System.IO.File.ReadAllTextAsync(_filePath);
        return JsonSerializer.Deserialize<List<LoanApplication>>(existingJson) ?? new List<LoanApplication>();
      }
      return new List<LoanApplication>();
    }

    [HttpPost("[action]")]
    public async Task<IActionResult> CreateApplication([FromBody] LoanApplication loanApplication)
    {
      if (loanApplication == null ||
          string.IsNullOrEmpty(loanApplication.PersonalInformation.Name.First) ||
          string.IsNullOrEmpty(loanApplication.PersonalInformation.Name.Last) ||
          string.IsNullOrEmpty(loanApplication.PersonalInformation.PhoneNumber) ||
          string.IsNullOrEmpty(loanApplication.PersonalInformation.Email) ||
          string.IsNullOrEmpty(loanApplication.ApplicationNumber) ||
          loanApplication.LoanTerms.Amount <= 0)
      {
        return BadRequest("Invalid application data. All fields are required and must be valid.");
      }

      loanApplication.DateApplied = DateTime.UtcNow;
      var applications = await GetApplicationsFromFileAsync();
      applications.Add(loanApplication);
      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Created Successfully." });
    }

    [HttpGet("[action]")]
    public async Task<IActionResult> GetApplications()
    {
      var applications = await GetApplicationsFromFileAsync();
      return Ok(applications);
    }

    [HttpGet("[action]/{applicationNumber}")]
    public async Task<IActionResult> GetApplication(string applicationNumber)
    {
      var applications = await GetApplicationsFromFileAsync();
      var application = applications.Find(app => app.ApplicationNumber == applicationNumber);
      if (application == null)
      {
        return NotFound("Application not found.");
      }
      return Ok(application);
    }

    [HttpPut("[action]/{applicationNumber}")]
    public async Task<IActionResult> UpdateApplication(string applicationNumber, [FromBody] LoanApplication updatedApplication)
    {
      var applications = await GetApplicationsFromFileAsync();
      var existingApplication = applications.Find(app => app.ApplicationNumber == applicationNumber);
      if (existingApplication == null)
      {
        return NotFound("Application not found.");
      }

      // Update the existing application with new values
      existingApplication.PersonalInformation = updatedApplication.PersonalInformation;
      existingApplication.ApplicationNumber = updatedApplication.ApplicationNumber;
      existingApplication.LoanTerms = updatedApplication.LoanTerms;
      existingApplication.Status = updatedApplication.Status;

      var json = JsonSerializer.Serialize(applications);
      await System.IO.File.WriteAllTextAsync(_filePath, json);
      return Ok(new { message = "Updated Successfully." });
    }

      [HttpDelete("[action]/{applicationNumber}")]
      public async Task<IActionResult> DeleteApplication(string applicationNumber)
      {
          var applications = await GetApplicationsFromFileAsync();
          var applicationToRemove = applications.Find(app => app.ApplicationNumber == applicationNumber);
          if (applicationToRemove == null)
          {
              return NotFound("Application not found.");
          }

          applications.Remove(applicationToRemove);
          var json = JsonSerializer.Serialize(applications);
          await System.IO.File.WriteAllTextAsync(_filePath, json);
          return Ok(new { message = "Deleted Successfully." });
      }
  }

}
