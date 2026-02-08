namespace GPS.ApplicationManager.Web.Controllers.Models
{
  public class LoanTerms
  {
    public decimal Amount { get; set; }
    public decimal MonthlyPaymentAmount { get; set; }
    public int Term { get; set; } // in months I assume
  }
}