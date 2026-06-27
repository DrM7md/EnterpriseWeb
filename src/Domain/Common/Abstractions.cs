namespace Domain.Common;

/// <summary>كيان يملك مفتاحًا أساسيًّا من نوع <see cref="long"/>.</summary>
public interface IEntity
{
    long Id { get; }
}

/// <summary>كيان قابل للعزل — مربوط بوحدة تنظيمية. لا سجل بلا scope.</summary>
public interface IOwnedByUnit
{
    long OwnerUnitId { get; set; }
}

/// <summary>كيان قابل للحذف الناعم — يُخفى عبر Global Query Filter.</summary>
public interface ISoftDeletable
{
    bool IsDeleted { get; set; }
    DateTimeOffset? DeletedAtUtc { get; set; }
    long? DeletedBy { get; set; }
}

/// <summary>كيان مُدقَّق — من/متى أنشأ وعدّل.</summary>
public interface IAuditable
{
    DateTimeOffset CreatedAtUtc { get; set; }
    long? CreatedBy { get; set; }
    DateTimeOffset? UpdatedAtUtc { get; set; }
    long? UpdatedBy { get; set; }
}
