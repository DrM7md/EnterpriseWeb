namespace Domain.Common;

/// <summary>قاعدة لكل الكيانات: مفتاح + توكن تزامن (Optimistic Concurrency).</summary>
public abstract class Entity : IEntity
{
    public long Id { get; protected set; }

    /// <summary>rowversion — يمنع الكتابة فوق تعديل متزامن.</summary>
    public byte[] RowVersion { get; set; } = [];
}

/// <summary>كيان مُدقَّق + قابل للحذف الناعم — الأساس لمعظم كيانات الأعمال.</summary>
public abstract class AuditableEntity : Entity, IAuditable, ISoftDeletable
{
    public DateTimeOffset CreatedAtUtc { get; set; }
    public long? CreatedBy { get; set; }
    public DateTimeOffset? UpdatedAtUtc { get; set; }
    public long? UpdatedBy { get; set; }

    public bool IsDeleted { get; set; }
    public DateTimeOffset? DeletedAtUtc { get; set; }
    public long? DeletedBy { get; set; }
}
