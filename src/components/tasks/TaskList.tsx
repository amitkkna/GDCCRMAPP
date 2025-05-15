import React from 'react';
import { Task } from '@/types/database.types';
import { Edit, Trash2, CheckCircle, RefreshCcw, ExternalLink, Calendar } from 'lucide-react';
import Link from 'next/link';

interface TaskListProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onComplete?: (task: Task) => void;
  onReopen?: (task: Task) => void;
  onDelete: (task: Task) => void;
  emptyMessage: string;
}

export default function TaskList({
  tasks,
  onEdit,
  onComplete,
  onReopen,
  onDelete,
  emptyMessage
}: TaskListProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="overflow-x-auto">
      {tasks.length === 0 ? (
        <div className="px-6 py-8 text-center text-sm text-gray-500">
          {emptyMessage}
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Details of Requirement
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Assigned To
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Due Date
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(task.created_at)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="text-sm font-medium text-gray-900">{task.title}</div>
                    {task.enquiry_id && (
                      <Link href={`/enquiries?edit=${task.enquiry_id}`} className="ml-2 text-blue-600 hover:text-blue-800">
                        <ExternalLink className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    task.status === 'Pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {task.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.description ? (
                    task.description.length > 50
                      ? `${task.description.substring(0, 50)}...`
                      : task.description
                  ) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.assigned_to}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.due_date ? formatDate(task.due_date) : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex space-x-2 justify-end">
                    <button
                      onClick={() => onEdit(task)}
                      className="text-blue-600 hover:text-blue-900"
                      title="Edit Task"
                    >
                      <Edit className="h-5 w-5" />
                    </button>

                    {task.status === 'Pending' && onComplete && (
                      <button
                        onClick={() => onComplete(task)}
                        className="text-green-600 hover:text-green-900"
                        title="Mark as Completed"
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                    )}

                    {task.status === 'Completed' && onReopen && (
                      <button
                        onClick={() => onReopen(task)}
                        className="text-amber-600 hover:text-amber-900"
                        title="Reopen Task"
                      >
                        <RefreshCcw className="h-5 w-5" />
                      </button>
                    )}

                    <button
                      onClick={() => onDelete(task)}
                      className="text-red-600 hover:text-red-900"
                      title="Delete Task"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
