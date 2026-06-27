using FluentValidation;

namespace Application.Features.OrgUnits;

public sealed class CreateOrgUnitRequestValidator : AbstractValidator<CreateOrgUnitRequest>
{
    public CreateOrgUnitRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
        RuleFor(x => x.Code).NotEmpty().MaximumLength(50)
            .Matches("^[A-Za-z0-9_-]+$").WithMessage("الرمز: حروف/أرقام/شرطة فقط.");
    }
}

public sealed class UpdateOrgUnitRequestValidator : AbstractValidator<UpdateOrgUnitRequest>
{
    public UpdateOrgUnitRequestValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
    }
}
